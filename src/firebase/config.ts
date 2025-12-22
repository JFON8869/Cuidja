// This file is dynamically generated from environment variables
// and should not be manually edited.

// Returns the Firebase configuration object.
export const getFirebaseConfig = () => {
  const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };

  // Basic validation to ensure that all required environment variables are set.
  for (const [key, value] of Object.entries(firebaseConfig)) {
    if (value === undefined) {
      // In a production environment, you might want to throw an error.
      // For this context, we log a warning to the console.
      console.warn(
        `Firebase config property '${key}' is not set in environment variables.`
      );
    }
  }

  return firebaseConfig;
};
