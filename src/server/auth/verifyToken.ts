import { getAuth } from "@/server/firebase/admin";

export interface AuthContext {
  uid: string;
  email?: string;
}

export async function verifyBearerToken(authorizationHeader?: string): Promise<AuthContext> {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authorizationHeader.substring("Bearer ".length);
  const decoded = await getAuth().verifyIdToken(token);
  return { uid: decoded.uid, email: decoded.email };
}


