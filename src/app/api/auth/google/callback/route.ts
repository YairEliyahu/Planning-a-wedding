import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/utils/dbConnect';
import User from '@/models/User';

// Define type for lean user query result
type LeanUser = {
  _id: string;
  email: string;
  fullName?: string;
  displayName?: string;
  authProvider?: string;
  profilePicture?: string;
  isProfileComplete?: boolean;
  password?: string;
};

// הצהרה על פונקציה נפרדת לקבלת מידע משתמש
async function getUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}

export async function GET(request: Request) {
  console.time('google-auth-callback');
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=NoCode', request.url));
    }

    // שימוש ב-OAuth2Client במקום google.auth.OAuth2
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // קבלת tokens + חיבור DB במקביל
    const [tokenResponse] = await Promise.all([
      oauth2Client.getToken(code),
      connectToDatabase()
    ]);

    const { tokens } = tokenResponse;
    
    // קריאה ישירה ל-API במקום googleapis
    console.time('userinfo-get');
    const googleUserData = await getUserInfo(tokens.access_token!);
    console.timeEnd('userinfo-get');

    if (!googleUserData.email) {
      return NextResponse.redirect(new URL('/login?error=NoEmail', request.url));
    }

    // מציאת משתמש מהר יותר עם אינדקס מתאים
    console.time('find-or-create-user');
    const existingUser = await User.findOne({ email: googleUserData.email })
      .select('_id email fullName displayName authProvider profilePicture isProfileComplete password')
      .lean() as LeanUser | null;

    let finalUserData: LeanUser | (typeof User.prototype) | null;
    let isNewUser = false;
    
    if (existingUser) {
      console.log('Found existing user:', existingUser._id);
      
      if (existingUser.authProvider === 'email' || !existingUser.authProvider) {
        await User.findByIdAndUpdate(existingUser._id, {
          authProvider: existingUser.password ? 'hybrid' : 'google',
          profilePicture: googleUserData.picture || existingUser.profilePicture,
          emailVerified: true
        });
        
        finalUserData = {
          ...existingUser,
          authProvider: existingUser.password ? 'hybrid' : 'google',
          profilePicture: googleUserData.picture || existingUser.profilePicture,
          emailVerified: true
        };
      } else {
        finalUserData = existingUser;
      }
    } else {
      const newUser = new User({
        email: googleUserData.email,
        fullName: googleUserData.name,
        displayName: googleUserData.name,
        authProvider: 'google',
        profilePicture: googleUserData.picture,
        emailVerified: true,
        isProfileComplete: false
      });
      finalUserData = await newUser.save();
      console.log('Created new user:', finalUserData._id);
      isNewUser = true;
    }
    console.timeEnd('find-or-create-user');

    // חתימת JWT עם נתוני משתמש הכרחיים בלבד
    console.time('jwt-sign');
    const token = jwt.sign(
      {
        userId: finalUserData._id.toString(),
        email: finalUserData.email,
        fullName: finalUserData.fullName || '',
        isProfileComplete: finalUserData.isProfileComplete || false
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    console.timeEnd('jwt-sign');

    // יצירת אובייקט נתוני משתמש מצומצם לצד לקוח
    const userDataForClient = {
      _id: finalUserData._id.toString(),
      email: finalUserData.email,
      fullName: finalUserData.fullName,
      displayName: finalUserData.displayName,
      profilePicture: finalUserData.profilePicture,
      isProfileComplete: finalUserData.isProfileComplete
    };

    // קביעת כתובת הפניה בהתאם למצב המשתמש
    let redirectUrl;
    if (isNewUser || !finalUserData.isProfileComplete) {
      redirectUrl = new URL('/complete-profile', request.url);
    } else {
      redirectUrl = new URL('/', request.url);
    }

    // הוספת טוקן ונתוני משתמש לכתובת
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(userDataForClient));

    console.timeEnd('google-auth-callback');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google callback:', error);
    console.timeEnd('google-auth-callback');
    return NextResponse.redirect(new URL('/login?error=CallbackFailed', request.url));
  }
}
