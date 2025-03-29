import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import connectToDatabase from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// מטמון עבור חיבור ה-OAuth2, כדי למנוע יצירה חדשה בכל קריאה
let cachedOAuth2Client: any = null;

export async function GET(request: Request) {
  console.time('google-auth-callback'); // מדידת זמן ביצועים
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=NoCode', request.url));
    }

    // שימוש במטמון חיבור OAuth2 אם קיים
    if (!cachedOAuth2Client) {
      cachedOAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    }

    const oauth2Client = cachedOAuth2Client;

    // ביצוע קריאה מקבילה של הטוקן ומסד הנתונים
    const tokenPromise = oauth2Client.getToken(code);
    const dbConnectPromise = connectToDatabase();
    
    const [tokenResponse, _] = await Promise.all([tokenPromise, dbConnectPromise]);
    
    const { tokens } = tokenResponse;
    oauth2Client.setCredentials(tokens);
    
    // שימוש באובייקט oauth2 קיים במקום ליצור חדש
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    
    console.time('userinfo-get');
    const { data } = await oauth2.userinfo.get();
    console.timeEnd('userinfo-get');

    if (!data.email) {
      return NextResponse.redirect(new URL('/login?error=NoEmail', request.url));
    }

    // מציאת משתמש מהר יותר עם אינדקס מתאים (הנחה שיש אינדקס על מייל)
    console.time('find-or-create-user');
    const existingUser = await User.findOne({ email: data.email }).select('_id email fullName displayName authProvider profilePicture isProfileComplete');

    let userData;
    let isNewUser = false;
    
    if (existingUser) {
      console.log('Found existing user:', existingUser._id);
      userData = existingUser;
    } else {
      // יצירת משתמש חדש עם מידע מינימלי
      const newUser = new User({
        email: data.email,
        fullName: data.name,
        displayName: data.name,
        authProvider: 'google',
        profilePicture: data.picture,
        emailVerified: true,
        isProfileComplete: false
      });
      userData = await newUser.save();
      console.log('Created new user:', userData._id);
      isNewUser = true;
    }
    console.timeEnd('find-or-create-user');

    // חתימת JWT עם נתוני משתמש הכרחיים בלבד
    console.time('jwt-sign');
    const token = jwt.sign(
      {
        userId: userData._id.toString(),
        email: userData.email,
        fullName: userData.fullName || '',
        isProfileComplete: userData.isProfileComplete || false
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    console.timeEnd('jwt-sign');

    // יצירת אובייקט נתוני משתמש מצומצם לצד לקוח
    const userDataForClient = {
      _id: userData._id.toString(),
      email: userData.email,
      fullName: userData.fullName,
      displayName: userData.displayName,
      profilePicture: userData.profilePicture,
      isProfileComplete: userData.isProfileComplete
    };

    // קביעת כתובת הפניה בהתאם למצב המשתמש
    let redirectUrl;
    if (isNewUser || !userData.isProfileComplete) {
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
