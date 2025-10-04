import { NextRequest, NextResponse } from "next/server";
import { verifyBearerToken } from "@/server/auth/verifyToken";
import { getFirestore } from "@/server/firebase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    await verifyBearerToken(req.headers.get("authorization") || undefined);
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase();
    if (!q || q.length < 1) return NextResponse.json({ users: [] });

    // prefix search by email or display name (lowercased)
    const db = getFirestore();
    const [byEmail, byName] = await Promise.all([
      db
        .collection("users")
        .orderBy("emailLower")
        .startAt(q)
        .endAt(`${q}\\uf8ff`)
        .limit(20)
        .get(),
      db
        .collection("users")
        .orderBy("displayNameLower")
        .startAt(q)
        .endAt(`${q}\\uf8ff`)
        .limit(20)
        .get(),
    ]);
    const mapDoc = (d: any) => ({ uid: d.id, ...(d.data() as any) });
    const merged = new Map<string, any>();
    byEmail.docs.forEach(d => merged.set(d.id, mapDoc(d)));
    byName.docs.forEach(d => merged.set(d.id, mapDoc(d)));
    const users = Array.from(merged.values()).slice(0, 20);
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
