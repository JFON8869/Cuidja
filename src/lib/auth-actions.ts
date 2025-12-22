'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
} from 'firebase/auth';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Dispatch, SetStateAction } from 'react';
import type { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
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

    // Save user to firestore
    if (firestore) {
        await setDoc(doc(firestore, "users", user.uid), {
            name: user.displayName,
            email: user.email,
        }, { merge: true });
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
