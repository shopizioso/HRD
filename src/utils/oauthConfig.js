// OAuth Configuration
export const oauthConfig = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
    scope: 'openid profile email',
    authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  microsoft: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || 'http://localhost:5173/auth/microsoft/callback',
    scope: 'openid profile email',
    authEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
  }
};

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: oauthConfig.google.clientId,
    redirect_uri: oauthConfig.google.redirectUri,
    response_type: 'code',
    scope: oauthConfig.google.scope,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${oauthConfig.google.authEndpoint}?${params.toString()}`;
}

export function getMicrosoftAuthUrl() {
  const params = new URLSearchParams({
    client_id: oauthConfig.microsoft.clientId,
    redirect_uri: oauthConfig.microsoft.redirectUri,
    response_type: 'code',
    scope: oauthConfig.microsoft.scope,
    response_mode: 'query'
  });

  return `${oauthConfig.microsoft.authEndpoint}?${params.toString()}`;
}

export function generatePKCE() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let codeVerifier = '';
  
  for (let i = 0; i < 128; i++) {
    codeVerifier += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  localStorage.setItem('oauth_code_verifier', codeVerifier);
  return codeVerifier;
}

export function getPKCEChallenge(codeVerifier) {
  // Simplified - in production use crypto library
  return btoa(codeVerifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function handleOAuthCallback(provider, code) {
  try {
    const response = await fetch(`http://localhost:5000/api/auth/${provider}/callback?code=${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      return { success: true, user: data.user };
    }
    
    return { success: false, error: data.error };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false, error: error.message };
  }
}
