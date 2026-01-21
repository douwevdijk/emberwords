import { storage } from './firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// Upload a base64 image and return the download URL
export const uploadImage = async (
  base64Data: string,
  path: string
): Promise<string | null> => {
  try {
    const storageRef = ref(storage, path);

    // Upload as data URL (base64)
    await uploadString(storageRef, base64Data, 'data_url');

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Generate a unique path for memory images
export const generateMemoryImagePath = (memoryId: string): string => {
  const timestamp = Date.now();
  return `memories/${memoryId}_${timestamp}.jpg`;
};
