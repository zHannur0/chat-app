import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { getAuth } from '@/server/firebase/admin';

// Accept Google ID token from frontend and exchange/verify via Firebase Auth
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ error: 'idToken required' }, { status: 400 });

    // Verify Google ID token as Firebase credential by signInWithIdp REST
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing FIREBASE_WEB_API_KEY' }, { status: 500 });

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody: `id_token=${idToken}&providerId=google.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true,
      })
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'google signIn failed' }, { status: 400 });

    // Optionally ensure user exists in Admin
    const decoded = await getAuth().verifyIdToken(data.idToken);
    return NextResponse.json({ idToken: data.idToken, refreshToken: data.refreshToken, localId: data.localId, email: decoded.email });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}


