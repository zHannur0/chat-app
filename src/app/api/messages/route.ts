import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { verifyBearerToken } from '@/server/auth/verifyToken';
import { createMessage, listMessages, markRead } from '@/server/firestore/dao';
import { ChatDoc, MessageDoc } from '@/server/firestore/schema';
const BOT_NAME = process.env.BOT_NAME || 'AI Bot';
import { getChatById } from '@/server/firestore/dao';
import { generateBotReply } from '@/server/bot/vertex';

function sleep(ms: number) { return new Promise(res => setTimeout(res, ms)); }

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(req.headers.get('authorization') || undefined);
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');
    const beforeTs = searchParams.get('beforeTs');
    const limit = Number(searchParams.get('limit') || 30);
    if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    const items = await listMessages(chatId, Math.max(1, Math.min(100, limit)), beforeTs ? Number(beforeTs) : undefined);
    return NextResponse.json({ messages: items.reverse() });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized', detail: String(e) }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(req.headers.get('authorization') || undefined);
    const { chatId, text } = await req.json();
    if (!chatId || !text) return NextResponse.json({ error: 'chatId and text required' }, { status: 400 });
    const now = Date.now();
    const msg: MessageDoc = { id: crypto.randomUUID(), chatId, senderId: auth.uid, text, createdAt: now };
    await createMessage(msg);

    // For bot chats, schedule a delayed reply 1-5s (auto-detect)
    const chat: ChatDoc | undefined = await getChatById(chatId);
    const envBotId = process.env.BOT_ID || 'bot:assistant';
    const botId = chat?.botId || envBotId;
    if (chat?.type === 'bot') {
      // Backfill botId on chat if missing
      if (!chat.botId && botId) {
        try { await (await import('@/server/firestore/dao')).chatsCollection().doc(chatId).set({ botId }, { merge: true }); } catch {}
      }
      // Generate reply asynchronously with delay, do not block client response
      const delay = 1000 + Math.floor(Math.random() * 4000);
      sleep(delay).then(async () => {
        try {
          const replyText = await generateBotReply(text);
          const reply: MessageDoc = { id: crypto.randomUUID(), chatId, senderId: botId, text: replyText, createdAt: Date.now(), isBot: true };
          await createMessage(reply);
        } catch (err) {
          // Swallow rate-limit or other errors; no fallback message per requirement
          console.error('Bot reply failed:', err);
        }
      }).catch(() => {});
    }

    return NextResponse.json({ message: msg });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized', detail: String(e) }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(req.headers.get('authorization') || undefined);
    const { chatId, readAt } = await req.json();
    if (!chatId) return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    const ts = readAt ? Number(readAt) : Date.now();
    await markRead(chatId, auth.uid, ts);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized', detail: String(e) }, { status: 401 });
  }
}


