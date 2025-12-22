'use client';

import { getFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Always initialize with the config from environment variables.
  // This ensures consistency across client and server environments in Next.js.
  const firebaseConfig = getFirebaseConfig();

  // Validate that the config was actually loaded.
  if (!firebaseConfig.apiKey) {
    // This check is critical on the client side.
    throw new Error('Firebase API Key is missing. Check your .env file and ensure it is prefixed with NEXT_PUBLIC_');
  }

  // To prevent re-initialization on hot reloads, check if an app is already initialized.
  const apps = getApps();
  const app = apps.length ? apps[0] : initializeApp(firebaseConfig);

  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
