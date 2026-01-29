import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { Gift } from './types';

const GIFTS_COLLECTION = 'gifts';

// Get a single gift by ID
export const getGiftById = async (id: string): Promise<Gift | null> => {
  try {
    const docRef = doc(db, GIFTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Gift;
    }
    return null;
  } catch (error) {
    console.error('Error fetching gift:', error);
    return null;
  }
};

// Save a gift to Firestore
export const saveGift = async (gift: Gift): Promise<string | null> => {
  try {
    const id = `gift-${Date.now()}`;
    const docRef = doc(db, GIFTS_COLLECTION, id);
    await setDoc(docRef, {
      withPerson: gift.withPerson,
      memory: gift.memory,
      location: gift.location,
      word: gift.word,
      translation: gift.translation,
      country: gift.country,
      pronunciation: gift.pronunciation || null,
      meaning: gift.meaning,
      poem: gift.poem,
      timestamp: Date.now()
    });
    return id;
  } catch (error) {
    console.error('Error saving gift:', error);
    return null;
  }
};
