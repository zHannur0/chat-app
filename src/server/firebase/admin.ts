import * as admin from 'firebase-admin';

declare global {
  // eslint-disable-next-line no-var
  var __FIREBASE_ADMIN_APP__: admin.app.App | undefined;
  // eslint-disable-next-line no-var
  var __FIRESTORE_CONFIGURED__: boolean | undefined;
}

export function getFirebaseAdminApp(): admin.app.App {
  if (globalThis.__FIREBASE_ADMIN_APP__) {
    return globalThis.__FIREBASE_ADMIN_APP__;
  }

  let app: admin.app.App;
  const apps = admin.apps;
  if (apps.length) {
    app = apps[0]!;
  } else {
    // Prefer Application Default Credentials if available (GOOGLE_APPLICATION_CREDENTIALS)
    const useADC = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (useADC) {
      app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Fallback to explicit service account envs
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials envs: require FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY or set GOOGLE_APPLICATION_CREDENTIALS');
      }

      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  }

  // Configure Firestore once, immediately after app init, before any use
  if (!globalThis.__FIRESTORE_CONFIGURED__) {
    const db = app.firestore();
    // @ts-ignore - settings exists in Admin SDK
    db.settings({ ignoreUndefinedProperties: true });
    globalThis.__FIRESTORE_CONFIGURED__ = true;
  }

  globalThis.__FIREBASE_ADMIN_APP__ = app;
  return app;
}

export function getAuth() {
  return getFirebaseAdminApp().auth();
}

export function getFirestore() {
  return getFirebaseAdminApp().firestore();
}

export type AdminUser = admin.auth.DecodedIdToken;


