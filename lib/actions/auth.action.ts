"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { DEMO, demoUser } from "@/lib/demo";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created.",
    };
  } catch (e) {
    const error = e as { code?: string };
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
    return { success: true, message: "Signed in." };
  } catch (error) {
    console.error("Sign-in failed:", error);

    return {
      success: false,
      message: "We couldn't sign you in. Try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  if (DEMO) return demoUser;
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;
    // Suspended accounts (set from the admin dashboard) are treated as signed out.
    if (userRecord.data()?.status === "suspended") return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

/** Sign-in or sign-up with Google: creates the user document on first visit. */
export async function signInWithProvider(params: { idToken: string; uid: string; name: string; email: string; photoURL?: string | null }) {
  const { idToken, uid, name, email, photoURL } = params;
  try {
    const ref = db.collection("users").doc(uid);
    const snap = await ref.get();
    const isNew = !snap.exists;
    if (isNew) await ref.set({ name, email, ...(photoURL ? { profileURL: photoURL } : {}) });
    await setSessionCookie(idToken);
    return { success: true, isNew, onboarded: !isNew && !!snap.data()?.onboarded };
  } catch (error) {
    console.error("Provider sign-in failed:", error);
    return { success: false, isNew: false, onboarded: false };
  }
}

export async function updateUserProfile(params: {
  name?: string;
  profileURL?: string | null;
  targetRole?: string;
  level?: string;
  techstack?: string[];
  onboarded?: boolean;
}) {
  if (DEMO) return { success: true };
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Your session has expired. Sign in again." };
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
  if (typeof clean.name === "string" && (clean.name as string).trim().length < 2) {
    return { success: false, message: "Enter a name with at least 2 characters." };
  }
  if (typeof clean.profileURL === "string" && (clean.profileURL as string).length > 200_000) {
    return { success: false, message: "That photo is too large. Use one under 150 KB." };
  }
  await db.collection("users").doc(user.id).set(clean, { merge: true });
  return { success: true };
}

/** Deletes the Firebase Auth account, the profile, interviews and feedback, then clears the session. */
export async function deleteAccount() {
  if (DEMO) return { success: true };
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Your session has expired. Sign in again." };
  try {
    const batch = db.batch();
    for (const col of ["interviews", "feedback"]) {
      const docs = await db.collection(col).where("userId", "==", user.id).get();
      docs.forEach((d) => batch.delete(d.ref));
    }
    batch.delete(db.collection("users").doc(user.id));
    await batch.commit();
    await auth.deleteUser(user.id);
    await signOut();
    return { success: true };
  } catch (error) {
    console.error("Delete account failed:", error);
    return { success: false, message: "We couldn't delete your account. Try again or contact support." };
  }
}
