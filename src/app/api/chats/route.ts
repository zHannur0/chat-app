import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyBearerToken } from '@/server/auth/verifyToken';
import { addMembership, createChat, getChatById, listUserChats } from '@/server/firestore/dao';
import { ChatDoc, ChatType, MembershipDoc } from '@/server/firestore/schema';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(req.headers.get('authorization') || undefined);
    const chats = await listUserChats(auth.uid);
    return NextResponse.json({ chats });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized', detail: String(e) }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(req.headers.get('authorization') || undefined);
    const now = Date.now();
    const { type, memberIds, title, botId } = await req.json();
    if (!type || !Array.isArray(memberIds)) {
      return NextResponse.json({ error: 'type and memberIds required' }, { status: 400 });
    }
    const chatId = crypto.randomUUID();
    const chat: ChatDoc = {
      id: chatId,
      type: (type as ChatType),
      title,
      createdBy: auth.uid,
      createdAt: now,
      updatedAt: now,
      memberIds: Array.from(new Set([auth.uid, ...memberIds])),
      botId,
    };
    await createChat(chat);
    await Promise.all(chat.memberIds.map(userId => {
      const m: MembershipDoc = { chatId, userId, role: userId === auth.uid ? 'owner' : 'member', joinedAt: now };
      return addMembership(m);
    }));
    return NextResponse.json({ chat });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized', detail: String(e) }, { status: 401 });
  }
}


