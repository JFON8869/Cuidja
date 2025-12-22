'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] =
    useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only once on the client side after the component mounts.
    // It ensures that Firebase is initialized in the browser environment
    // where window and process.env.NEXT_PUBLIC_* variables are available.
    if (typeof window !== 'undefined' && !firebaseServices) {
      const services = initializeFirebase();
      setFirebaseServices(services);
    }
  }, [firebaseServices]); // Dependency array ensures this logic re-evaluates if firebaseServices changes, but the !firebaseServices check prevents re-initialization.

  // CRITICAL: By returning null until firebaseServices is initialized,
  // we prevent any child components from rendering and attempting to use
  // Firebase services before they are ready. This is the key to preventing
  // the 'auth/api-key-not-valid' error.
  if (!firebaseServices) {
    return null;
  }

  // Once Firebase is initialized, provide the services to the rest of the app.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
