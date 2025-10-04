import { NextRequest, NextResponse } from "next/server";
import { getAuth, getFirestore } from "@/server/firebase/admin";
import { upsertUser } from "@/server/firestore/dao";
import { UserDoc } from "@/server/firestore/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing Bearer token" },
        { status: 401 }
      );
    }
    const token = authHeader.substring("Bearer ".length);
    const adminAuth = getAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    // Backfill user doc if missing
    const db = getFirestore();
    const doc = await db.collection("users").doc(decoded.uid).get();
    let displayName: string | undefined;
    let photoURL: string | undefined;
    if (doc.exists) {
      const data = doc.data() as any;
      displayName = data?.displayName;
      photoURL = data?.photoURL;
    } else {
      const now = Date.now();
      displayName = (decoded as any)?.name;
      photoURL = (decoded as any)?.picture;
      try {
        const userRecord = await adminAuth.getUser(decoded.uid);
        displayName = userRecord.displayName || displayName;
        photoURL = userRecord.photoURL || photoURL;
      } catch {
        // Ignore errors when fetching user record
      }
      const user: UserDoc = {
        uid: decoded.uid,
        displayName,
        displayNameLower: (displayName || "").toLowerCase(),
        photoURL,
        createdAt: now,
        updatedAt: now,
      };
      await upsertUser(user);
    }

    return NextResponse.json({
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
      displayName,
      photoURL,
    });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
