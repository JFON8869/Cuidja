'use client';

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { getApp } from 'firebase/app'; 

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 *
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be saved (e.g., 'logos/user123').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  // It's crucial to get the initialized app instance this way,
  // especially in a client-side context where providers manage initialization.
  const app = getApp();
  const storage = getStorage(app);

  const storageRef = ref(storage, path);

  try {
    // Upload the file to the specified path
    const snapshot = await uploadBytes(storageRef, file);

    // Get the public URL of the file
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    // Re-throw a more specific error to be caught by the calling function.
    // This allows for more granular error handling in the UI.
    throw new Error('Failed to upload file. Check storage rules and network connection.');
  }
};
