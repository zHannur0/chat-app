import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/server/auth/verifyToken";
import { getAuth, getFirestore } from "@/server/firebase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await verifyBearerToken(req.headers.get("authorization") || undefined);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") || 20))
    );
    const startAfterEmail = searchParams.get("startAfterEmail");

    const db = getFirestore();
    let q = db.collection("users").orderBy("emailLower").limit(limit);
    if (startAfterEmail) {
      q = q.startAfter(startAfterEmail.toLowerCase());
    }
    const snaps = await q.get();
    const users = snaps.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));

    // Enrich missing displayName/photoURL from Auth records (best-effort)
    const auth = getAuth();
    await Promise.all(
      users.map(async (u, idx) => {
        if (!u.displayName || !u.displayNameLower || !u.photoURL) {
          try {
            const rec = await auth.getUser(u.uid);
            const displayName = rec.displayName || u.displayName;
            const photoURL = rec.photoURL || u.photoURL;
            if (displayName || photoURL) {
              users[idx] = {
                ...u,
                displayName,
                displayNameLower: (displayName || "").toLowerCase(),
                photoURL,
              };
              await getFirestore()
                .collection("users")
                .doc(u.uid)
                .set(
                  {
                    displayName,
                    displayNameLower: (displayName || "").toLowerCase(),
                    photoURL,
                    updatedAt: Date.now(),
                  },
                  { merge: true }
                );
            }
          } catch {
            // Ignore errors when updating user
          }
        }
      })
    );
    const nextCursor = users.length
      ? users[users.length - 1]?.emailLower
      : undefined;
    return NextResponse.json({ users, nextCursor });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
