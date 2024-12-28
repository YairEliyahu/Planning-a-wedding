import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import User from '@/models/User';
import connectToDatabase from '@/utils/dbConnect';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/google/callback'
    );

    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('No payload');

    await connectToDatabase();

    const originalName = payload.name || '';
    console.log('Original name from Google:', originalName);

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        email: payload.email,
        fullName: originalName,
        authProvider: 'google',
        providerId: payload.sub,
        profilePicture: payload.picture,
        displayName: originalName
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        fullName: originalName,
        displayName: originalName,
        profilePicture: user.profilePicture 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const redirectUrl = `/auth/callback?token=${encodeURIComponent(token)}&displayName=${encodeURIComponent(originalName)}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));

  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}
