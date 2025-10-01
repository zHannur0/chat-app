import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/server/auth/verifyToken';
import { getFirestore } from '@/server/firebase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await verifyBearerToken(req.headers.get('authorization') || undefined);
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').toLowerCase();
    if (!q || q.length < 2) return NextResponse.json({ users: [] });

    // prefix search by email (lowercased)
    const db = getFirestore();
    const snaps = await db.collection('users')
      .where('email', '>=', q)
      .where('email', '<=', q + '\uf8ff')
      .limit(20)
      .get();
    const users = snaps.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}


