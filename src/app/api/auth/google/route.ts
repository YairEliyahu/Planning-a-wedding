import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

export async function GET() {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
  });

  return NextResponse.redirect(authUrl);
}
