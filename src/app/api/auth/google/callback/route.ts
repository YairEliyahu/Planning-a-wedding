import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import connectToDatabase from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=NoCode', request.url));
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Get Google user data
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return NextResponse.redirect(new URL('/login?error=NoEmail', request.url));
    }

    // Connect to database and find user
    await connectToDatabase();
    const existingUser = await User.findOne({ email: data.email });

    let userData;
    let isNewUser = false;
    
    if (existingUser) {
      console.log('Found existing user:', existingUser._id);
      userData = existingUser;
    } else {
      // Create new user with minimal data
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

    // Generate JWT token with all necessary user data
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

    // Create user data object for the client
    const userDataForClient = {
      _id: userData._id.toString(),
      email: userData.email,
      fullName: userData.fullName,
      displayName: userData.displayName,
      profilePicture: userData.profilePicture,
      isProfileComplete: userData.isProfileComplete
    };

    // Determine redirect URL based on user status
    let redirectUrl;
    if (isNewUser || !userData.isProfileComplete) {
      redirectUrl = new URL('/complete-profile', request.url);
    } else {
      redirectUrl = new URL('/', request.url);
    }

    // Add token and user data to URL
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(userDataForClient));

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(new URL('/login?error=CallbackFailed', request.url));
  }
}
