import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/server/auth/verifyToken";
import { getChatById, usersCollection } from "@/server/firestore/dao";
import { getAuth } from "@/server/firebase/admin";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const auth = await verifyBearerToken(
      _req.headers.get("authorization") || undefined
    );
    const chat = await getChatById(params.id);
    if (!chat)
      return NextResponse.json({ error: "not found" }, { status: 404 });

    let peer:
      | {
          uid: string;
          displayName?: string;
          photoURL?: string;
          username?: string;
        }
      | undefined;
    if (chat.type === "direct") {
      const peerId = chat.memberIds.find(id => id !== auth.uid);
      if (peerId) {
        const uDoc = await usersCollection().doc(peerId).get();
        const u = uDoc.data() as any | undefined;
        let displayName = u?.displayName as string | undefined;
        let photoURL = u?.photoURL as string | undefined;
        const username = u?.username as string | undefined;
        let email = u?.email as string | undefined;
        try {
          const rec = await getAuth().getUser(peerId);
          displayName = displayName || rec.displayName || undefined;
          photoURL = photoURL || rec.photoURL || undefined;
          email = email || (rec.email as string | undefined);
        } catch {
          // Ignore errors when fetching user record
        }
        if (!displayName) displayName = username || email;
        peer = { uid: peerId, displayName, photoURL, username } as any;
        if (email) (peer as any).email = email;
      }
    } else if (chat.type === "bot") {
      peer = {
        uid: chat.botId || "bot:assistant",
        displayName: process.env.BOT_NAME || "AI Bot",
      };
    }

    return NextResponse.json({ chat: { ...chat, peer } });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
