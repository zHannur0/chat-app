import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth as _getAuth,
  type Auth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as
      | string
      | undefined,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MSG_SENDER_ID as
      | string
      | undefined,
  };
  app = getApps().length ? getApps()[0]! : initializeApp(config);
  return app;
}

export function getAuth(): Auth {
  if (auth) return auth;
  auth = _getAuth(getFirebaseApp());
  return auth;
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export async function startGoogleRedirect(): Promise<void> {
  const a = getAuth();
  const provider = getGoogleProvider();
  await signInWithRedirect(a, provider);
}

export async function completeRedirectAndGetIdToken(): Promise<
  string | undefined
> {
  const a = getAuth();
  const res = await getRedirectResult(a).catch(e => {
    console.log("error", e);
    return null;
  });
  const user = res?.user || a.currentUser;
  if (!user) return undefined;
  try {
    return await user.getIdToken();
  } catch {
    return undefined;
  }
}
