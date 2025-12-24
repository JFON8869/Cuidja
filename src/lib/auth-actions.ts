'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Dispatch, SetStateAction } from 'react';
import type { toast as ToastType } from 'react-hot-toast';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';

/**
 * Handles the Google Sign-In process, including creating a user document in Firestore if it doesn't exist.
 * @param auth The Firebase Auth instance.
 * @param firestore The Firestore instance.
 * @param router The Next.js App Router instance.
 * @param toast The toast notification instance.
 * @param setLoading A state setter function to control the loading state of the button.
 */
export const handleGoogleSignIn = async (
  auth: Auth,
  firestore: Firestore,
  router: AppRouterInstance,
  toast: typeof ToastType,
  setLoading: Dispatch<SetStateAction<boolean>>
) => {
  setLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document already exists
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        // Document doesn't exist, create it with initial structure
        await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            phone: user.phoneNumber || '', // Include phone number if available
            addresses: [], // Initialize with an empty addresses array
        });
    }

    toast.success('Login com Google realizado com sucesso!');
    router.push('/home');

  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'auth/popup-closed-by-user') {
      // User closed the popup, this is a normal action, so we don't show an error.
    } else {
      console.error('Google Sign-In Error:', error);
      toast.error('Não foi possível fazer login com o Google. Tente novamente.');
    }
  } finally {
    setLoading(false);
  }
};
