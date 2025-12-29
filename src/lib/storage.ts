'use client';

import {
  getStorage,
  ref,
  uploadBytesResumable, // Changed to resumable to track progress
  getDownloadURL,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getApp } from 'firebase/app';
import { logger } from './logger'; // Import the logger

/**
 * Uploads a file to Firebase Storage and returns its public URL.
 * Now includes logging and progress tracking.
 *
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be saved.
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export const uploadFile = (
  file: File,
  path: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const app = getApp();
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Track progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        logger.upload.progress({ fileName: file.name, progress });
      },
      (error) => {
        // Handle unsuccessful uploads
        logger.upload.error({ fileName: file.name, error });
        console.error('Error uploading file to Firebase Storage:', error);
        // Reject the promise to be caught by the calling function's try/catch block
        reject(error);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          logger.upload.success({ fileName: file.name, url: downloadURL });
          resolve(downloadURL);
        }).catch(reject); // Also reject if getDownloadURL fails
      }
    );
  });
};
