'use client';

import { getFirebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Define a type for the Firebase services object
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Singleton instance holder
let firebaseServices: FirebaseServices | null = null;

// IMPORTANT: This function now implements a singleton pattern.
export function initializeFirebase(): FirebaseServices {
  // If the services are already initialized, return the existing instance.
  if (firebaseServices) {
    return firebaseServices;
  }

  // Get the configuration from environment variables.
  const firebaseConfig = getFirebaseConfig();

  // Validate that the config was actually loaded with an API key.
  // This is the most critical check to prevent the "api-key-not-valid" error.
  if (!firebaseConfig.apiKey) {
    // This check is crucial on the client side.
    throw new Error(
      'Firebase API Key is missing. Check your .env file and ensure it is prefixed with NEXT_PUBLIC_'
    );
  }

  // To prevent re-initialization on hot reloads in some edge cases,
  // we still check if an app has been initialized by Firebase's internal SDK.
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);

  // Create the services object
  const services = {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };

  // Store the initialized services in the singleton holder.
  firebaseServices = services;

  return services;
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
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
