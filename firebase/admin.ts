import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initFirebaseAdmin() {
  const apps = getApps();

  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
}

// Demo mode (local design review only) runs without credentials.
const demo = process.env.NODE_ENV !== "production" && process.env.EXAMIFY_DEMO === "1";
export const { auth, db } = demo
  ? ({ auth: null, db: null } as unknown as ReturnType<typeof initFirebaseAdmin>)
  : initFirebaseAdmin();
