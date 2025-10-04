import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { verifyBearerToken } from "@/server/auth/verifyToken";
import {
  addMembership,
  createChat,
  // getChatById,
  membershipsCollection,
  messagesCollection,
  usersCollection,
  chatsCollection,
} from "@/server/firestore/dao";
import {
  ChatDoc,
  ChatType,
  MembershipDoc,
  MessageDoc,
} from "@/server/firestore/schema";

const BOT_ID = process.env.BOT_ID || "bot:assistant";
const BOT_NAME = process.env.BOT_NAME || "AI Bot";
const BOT_PHOTO = process.env.BOT_PHOTO || undefined;

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(
      req.headers.get("authorization") || undefined
    );

    // Get memberships for current user
    const mSnaps = await membershipsCollection()
      .where("userId", "==", auth.uid)
      .get();
    const memberships = mSnaps.docs.map(d => d.data() as MembershipDoc);

    // Ensure per-user bot chat exists (create if missing)
    const hasBotChat = await (async () => {
      const snaps = await chatsCollection()
        .where("type", "==", "bot")
        .where("memberIds", "array-contains", auth.uid)
        .get();
      return snaps.size > 0;
    })();

    if (!hasBotChat) {
      const now = Date.now();
      const chatId = crypto.randomUUID();
      const botChat: ChatDoc = {
        id: chatId,
        type: "bot" as ChatType,
        title: BOT_NAME,
        createdBy: auth.uid,
        createdAt: now,
        updatedAt: now,
        memberIds: [auth.uid, BOT_ID],
        botId: BOT_ID,
      };
      await createChat(botChat);
      await addMembership({
        chatId,
        userId: auth.uid,
        role: "owner",
        joinedAt: now,
      });
      await addMembership({
        chatId,
        userId: BOT_ID,
        role: "member",
        joinedAt: now,
      });
      memberships.push({
        chatId,
        userId: auth.uid,
        role: "owner",
        joinedAt: now,
      } as MembershipDoc);
    }

    if (memberships.length === 0) {
      return NextResponse.json({ chats: [], totalUnread: 0 });
    }

    // Batch fetch all chats
    const chatIds = memberships.map(m => m.chatId);
    const chatSnaps = await Promise.all(
      chatIds.map(id => chatsCollection().doc(id).get())
    );
    const chats = chatSnaps
      .map(snap => (snap.exists ? (snap.data() as ChatDoc) : null))
      .filter(Boolean) as ChatDoc[];

    // Batch fetch last messages for all chats
    const lastMessagesPromises = chats.map(chat =>
      messagesCollection()
        .where("chatId", "==", chat.id)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()
    );
    const lastMessagesSnaps = await Promise.all(lastMessagesPromises);
    const lastMessages = lastMessagesSnaps.map(
      snap => snap.docs[0]?.data() as MessageDoc | undefined
    );

    // Batch fetch unread counts
    const unreadCountsPromises = chats.map((chat, _index) => {
      const membership = memberships.find(m => m.chatId === chat.id);
      const lastReadAt = (membership as any)?.lastReadAt as number | undefined;

      if (lastReadAt) {
        return messagesCollection()
          .where("chatId", "==", chat.id)
          .where("senderId", "!=", auth.uid)
          .where("createdAt", ">", lastReadAt)
          .get();
      } else {
        return messagesCollection()
          .where("chatId", "==", chat.id)
          .where("senderId", "!=", auth.uid)
          .get();
      }
    });
    const unreadCountsSnaps = await Promise.all(unreadCountsPromises);
    const unreadCounts = unreadCountsSnaps.map(snap => snap.size);

    // Get all unique user IDs for peer info
    const allUserIds = new Set<string>();
    chats.forEach(chat => {
      if (chat.type === "direct") {
        chat.memberIds.forEach(id => {
          if (id !== auth.uid) allUserIds.add(id);
        });
      }
    });

    // Batch fetch user info for all peers
    const userSnaps =
      allUserIds.size > 0
        ? await Promise.all(
            Array.from(allUserIds).map(id => usersCollection().doc(id).get())
          )
        : [];
    const users = userSnaps
      .map(snap => (snap.exists ? { id: snap.id, ...snap.data() } : null))
      .filter(Boolean) as Array<{
      id: string;
      displayName?: string;
      photoURL?: string;
      email?: string;
    }>;

    // Build results
    const results: Array<
      ChatDoc & {
        lastMessage?: MessageDoc;
        unreadCount?: number;
        peer?: {
          uid: string;
          displayName?: string;
          photoURL?: string;
          email?: string;
        };
      }
    > = [];
    let totalUnread = 0;

    chats.forEach((chat, index) => {
      const lastMessage = lastMessages[index];
      const unreadCount = unreadCounts[index];
      totalUnread += unreadCount;

      // peer info for direct/bot
      let peer:
        | {
            uid: string;
            displayName?: string;
            photoURL?: string;
            email?: string;
          }
        | undefined;
      if (chat.type === "direct") {
        const peerId = chat.memberIds.find(id => id !== auth.uid);
        if (peerId) {
          const user = users.find(u => u.id === peerId);
          peer = {
            uid: peerId,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            email: user?.email,
          };
        }
      } else if (chat.type === "bot") {
        peer = {
          uid: chat.botId || BOT_ID,
          displayName: BOT_NAME,
          photoURL: BOT_PHOTO,
        };
      }

      results.push({ ...chat, lastMessage, unreadCount, peer });
    });

    // Sort: bot chats first, then by last activity desc
    results.sort((a, b) => {
      if (a.type === "bot" && b.type !== "bot") return -1;
      if (b.type === "bot" && a.type !== "bot") return 1;
      const at = a.lastMessage?.createdAt || a.updatedAt || 0;
      const bt = b.lastMessage?.createdAt || b.updatedAt || 0;
      return bt - at;
    });

    return NextResponse.json({ chats: results, totalUnread });
  } catch (e) {
    return NextResponse.json(
      { error: "Unauthorized", detail: String(e) },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(
      req.headers.get("authorization") || undefined
    );
    const now = Date.now();
    const { type, memberIds, title, botId } = await req.json();
    if (!type || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: "type and memberIds required" },
        { status: 400 }
      );
    }

    // Prevent duplicate direct chats: if a direct chat between these two users exists, return it
    if (type === "direct") {
      const peerId =
        Array.from(new Set(memberIds)).find(id => id !== auth.uid) ||
        memberIds[0];
      if (peerId) {
        const existingSnaps = await chatsCollection()
          .where("type", "==", "direct")
          .where("memberIds", "array-contains", auth.uid)
          .get();
        const existing = existingSnaps.docs
          .map(d => d.data() as ChatDoc)
          .find(
            c =>
              c.type === "direct" &&
              c.memberIds.length === 2 &&
              c.memberIds.includes(peerId)
          );
        if (existing) {
          return NextResponse.json({ chat: existing, existed: true });
        }
      }
    }
    const chatId = crypto.randomUUID();
    const chat: ChatDoc = {
      id: chatId,
      type: type as ChatType,
      title,
      createdBy: auth.uid,
      createdAt: now,
      updatedAt: now,
      memberIds: Array.from(new Set([auth.uid, ...memberIds])),
      botId,
    };
    await createChat(chat);
    await Promise.all(
      chat.memberIds.map(userId => {
        const m: MembershipDoc = {
          chatId,
          userId,
          role: userId === auth.uid ? "owner" : "member",
          joinedAt: now,
        };
        return addMembership(m);
      })
    );
    return NextResponse.json({ chat });
  } catch (e) {
    return NextResponse.json(
      { error: "Unauthorized", detail: String(e) },
      { status: 401 }
    );
  }
}
