import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/server/firebase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing Bearer token' }, { status: 401 });
    }
    const token = authHeader.substring('Bearer '.length);
    const decoded = await getAuth().verifyIdToken(token);
    return NextResponse.json({ uid: decoded.uid, email: decoded.email, emailVerified: decoded.email_verified === true });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}


