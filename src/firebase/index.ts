'use client';

import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
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

// IMPORTANT: This function now implements a singleton pattern and RECEIVES the config.
export function initializeFirebase(firebaseConfig: FirebaseOptions): FirebaseServices {
  // If the services are already initialized, return the existing instance.
  if (firebaseServices) {
    return firebaseServices;
  }
  
  // Basic validation inside the initialization function itself.
  if (!firebaseConfig || !firebaseConfig.apiKey) {
    throw new Error('Firebase config is invalid or missing apiKey. Initialization aborted.');
  }

  // To prevent re-initialization on hot reloads, check if an app has been initialized.
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
