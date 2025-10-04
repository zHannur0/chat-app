import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
import { verifyBearerToken } from "@/server/auth/verifyToken";
import { usersCollection } from "@/server/firestore/dao";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(
      req.headers.get("authorization") || undefined
    );
    const snap = await usersCollection().doc(auth.uid).get();
    const user = snap.data() || {};
    return NextResponse.json({
      uid: auth.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unauthorized", detail: String(e) },
      { status: 401 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyBearerToken(
      req.headers.get("authorization") || undefined
    );
    const { displayName, photoURL } = await req.json();
    const now = Date.now();
    await usersCollection()
      .doc(auth.uid)
      .set(
        {
          uid: auth.uid,
          displayName,
          displayNameLower: (displayName || "").toLowerCase() || undefined,
          photoURL: photoURL || undefined,
          updatedAt: now,
        },
        { merge: true }
      );
    const snap = await usersCollection().doc(auth.uid).get();
    const user = snap.data() || {};
    return NextResponse.json({
      uid: auth.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Unauthorized", detail: String(e) },
      { status: 401 }
    );
  }
}
