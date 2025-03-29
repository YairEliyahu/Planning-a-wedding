import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.time('google-auth-init');
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
      console.timeEnd('google-auth-init');
      return NextResponse.redirect(new URL('/login?error=MissingGoogleConfig', request.url));
    }

    console.log('Google OAuth Config:', {
      redirectUri,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    const searchParams = googleAuthUrl.searchParams;
    searchParams.append('client_id', clientId);
    searchParams.append('redirect_uri', redirectUri);
    searchParams.append('response_type', 'code');
    searchParams.append('scope', 'email profile openid');
    searchParams.append('access_type', 'offline');
    searchParams.append('include_granted_scopes', 'true');
    searchParams.append('prompt', 'consent');

    const redirectUrl = googleAuthUrl.toString();
    console.log('Redirecting to Google OAuth URL:', redirectUrl);
    console.timeEnd('google-auth-init');
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    console.timeEnd('google-auth-init');
    return NextResponse.redirect(new URL('/login?error=GoogleAuthInitFailed', request.url));
  }
}
