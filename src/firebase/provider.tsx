'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { WithId } from './firestore/use-collection';
import { Store } from '@/lib/data';

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Internal state for store data
interface StoreState {
    store: WithId<Store> | null;
    isStoreLoading: boolean;
    storeError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState extends UserAuthState, StoreState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends UserAuthState, StoreState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services, user authentication, and seller's store state.
 */
export const FirebaseProvider: React.FC<{
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });
  
  const [storeState, setStoreState] = useState<StoreState>({
      store: null,
      isStoreLoading: true,
      storeError: null
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth) { 
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => { 
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { 
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe(); 
  }, [auth]);

  // Effect to fetch and listen to the user's store data
  useEffect(() => {
      if (!firestore || !userAuthState.user) {
          // If there's no user or firestore, we set loading to false.
          setStoreState({ store: null, isStoreLoading: false, storeError: null });
          return;
      }

      setStoreState(prevState => ({ ...prevState, isStoreLoading: true }));
      
      const storesRef = collection(firestore, 'stores');
      const q = query(storesRef, where('userId', '==', userAuthState.user.uid));

      // Use a snapshot listener to get real-time updates for the store
      const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
              const storeDoc = snapshot.docs[0];
              setStoreState({
                  store: { id: storeDoc.id, ...storeDoc.data() } as WithId<Store>,
                  isStoreLoading: false,
                  storeError: null,
              });
          } else {
              setStoreState({ store: null, isStoreLoading: false, storeError: null });
          }
      }, (error) => {
          console.error("FirebaseProvider: Error fetching user store:", error);
           setStoreState({ store: null, isStoreLoading: false, storeError: error });
      });

      return () => unsubscribe();

  }, [firestore, userAuthState.user]);

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      ...userAuthState,
      ...storeState,
    };
  }, [firebaseApp, firestore, auth, userAuthState, storeState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services, user authentication, and store state.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    store: context.store,
    isStoreLoading: context.isStoreLoading,
    storeError: context.storeError
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserAuthState => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
