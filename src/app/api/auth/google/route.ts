import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing environment variables:', {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasRedirectUri: !!redirectUri
      });
      return NextResponse.redirect(new URL('/login?error=MissingGoogleConfig', request.url));
    }

    console.log('Google OAuth Config:', {
      redirectUri,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', clientId);
    googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'email profile openid');
    googleAuthUrl.searchParams.append('access_type', 'offline');
    googleAuthUrl.searchParams.append('include_granted_scopes', 'true');
    googleAuthUrl.searchParams.append('prompt', 'consent');

    console.log('Redirecting to Google OAuth URL:', googleAuthUrl.toString());
    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    return NextResponse.redirect(new URL('/login?error=GoogleAuthInitFailed', request.url));
  }
}
