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
  // We can't use the useFirebase hook here directly as this is not a component.
  // Instead, we get the initialized app instance first.
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
    console.error('Error uploading file:', error);
    // Depending on requirements, you might want to throw a more specific error
    // or handle it differently.
    throw new Error('Failed to upload file.');
  }
};
