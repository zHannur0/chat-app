declare global {
  interface Window {
    google?: any;
  }
}

export async function loadGoogleScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.google?.accounts?.id) return;
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.onload = () => {
      try { console.log('[auth] GIS loaded'); } catch {}
      resolve();
    };
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

export async function getGoogleIdTokenViaPopup(): Promise<string> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');

  return new Promise<string>((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (resp: any) => {
          if (resp?.access_token) {
            // Exchange access token for id_token using userinfo? Simpler: use initCodeClient for id_token
            reject(new Error('Received access token; expected id_token. Use getGoogleIdTokenOneTap instead.'));
          } else if (resp?.error) {
            reject(new Error(resp.error));
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      reject(e as Error);
    }
  });
}

export async function getGoogleIdTokenOneTap(): Promise<string> {
  await loadGoogleScript();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');

  return new Promise<string>((resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (credentialResponse: any) => {
          if (credentialResponse?.credential) {
            resolve(credentialResponse.credential as string);
          } else {
            reject(new Error('No credential'));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
      });
      // Diagnostic moment listener
      try {
        window.google.accounts.id.prompt((notification: any) => {
          try {
            console.log('[auth] one-tap moment', notification.getMomentType?.(), notification.getDismissedReason?.());
          } catch {}
        });
      } catch {
        window.google.accounts.id.prompt();
      }
      // Fallback timeout if GIS never calls back
      setTimeout(() => reject(new Error('Google One Tap timeout')), 15000);
    } catch (e) {
      reject(e as Error);
    }
  });
}


