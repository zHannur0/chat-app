import { NextRequest, NextResponse } from "next/server";
import { upsertUser } from "@/server/firestore/dao";
import { UserDoc } from "@/server/firestore/schema";
export const runtime = "nodejs";

// Email/password sign-in via Firebase Auth REST API
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "email and password required" },
        { status: 400 }
      );

    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey)
      return NextResponse.json(
        { error: "Missing FIREBASE_WEB_API_KEY" },
        { status: 500 }
      );

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.error?.message || "signIn failed" },
        { status: 400 }
      );

    // ensure user exists in Firestore for search
    const now = Date.now();
    const user: UserDoc = {
      uid: data.localId,
      email: data.email,
      emailLower: (data.email || "").toLowerCase(),
      displayName: undefined,
      displayNameLower: undefined,
      photoURL: undefined,
      createdAt: now,
      updatedAt: now,
    };
    await upsertUser(user);

    return NextResponse.json({
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      localId: data.localId,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
