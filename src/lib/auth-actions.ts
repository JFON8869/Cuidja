'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Dispatch, SetStateAction } from 'react';
import type { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useFirebase } from '@/firebase';

export const handleGoogleSignIn = async (
  auth: Auth,
  firestore: ReturnType<typeof useFirebase>['firestore'],
  router: AppRouterInstance,
  toast: ReturnType<typeof useToast>['toast'],
  setGoogleLoading: Dispatch<SetStateAction<boolean>>
) => {
  setGoogleLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user document already exists
    if (firestore) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // Document doesn't exist, create it with initial structure
            await setDoc(userDocRef, {
                name: user.displayName,
                email: user.email,
                addresses: [], // Initialize with an empty addresses array
            });
        }
        // If doc exists, we assume it's already structured correctly.
        // For a more robust solution, you could merge to ensure new fields are added.
    }


    toast({
      title: 'Login com Google realizado com sucesso!',
    });
    router.push('/perfil');
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    toast({
      variant: 'destructive',
      title: 'Falha no login com Google',
      description:
        'Não foi possível fazer login com o Google. Tente novamente.',
    });
  } finally {
    setGoogleLoading(false);
  }
};
