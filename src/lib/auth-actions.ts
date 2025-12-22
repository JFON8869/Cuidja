'use client';

import {
  GoogleAuthProvider,
  signInWithPopup,
  Auth,
  getAuth,
} from 'firebase/auth';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Dispatch, SetStateAction } from 'react';
import type { useToast } from '@/hooks/use-toast';
import { getApp } from 'firebase/app';

export const handleGoogleSignIn = async (
  auth: Auth,
  router: AppRouterInstance,
  toast: ReturnType<typeof useToast>['toast'],
  setGoogleLoading: Dispatch<SetStateAction<boolean>>
) => {
  setGoogleLoading(true);
  try {
    const provider = new GoogleAuthProvider();
    // In recent Firebase versions, it's safer to get the auth instance again
    // if there's any ambiguity about initialization context.
    const authInstance = getAuth(getApp());
    await signInWithPopup(authInstance, provider);
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
