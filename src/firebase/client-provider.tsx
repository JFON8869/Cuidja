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
    // Initialize Firebase only on the client side, after the component has mounted.
    // This ensures browser APIs and environment variables are available.
    if (typeof window !== 'undefined') {
      const services = initializeFirebase();
      setFirebaseServices(services);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!firebaseServices) {
    // Render nothing until Firebase is initialized on the client.
    // This prevents any child components from attempting to access Firebase services
    // before they are ready, which is the root cause of the API key error.
    return null;
  }

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
