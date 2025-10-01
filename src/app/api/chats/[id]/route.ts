import { NextRequest, NextResponse } from 'next/server';
import { verifyBearerToken } from '@/server/auth/verifyToken';
import { getChatById } from '@/server/firestore/dao';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyBearerToken(_req.headers.get('authorization') || undefined);
    const chat = await getChatById(params.id);
    if (!chat) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json({ chat });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}


