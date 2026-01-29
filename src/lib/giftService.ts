import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
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
      authorName: gift.authorName || null,
      memory: gift.memory,
      location: gift.location,
      word: gift.word,
      translation: gift.translation,
      explanation: gift.explanation,
      country: gift.country,
      pronunciation: gift.pronunciation || null,
      meaning: gift.meaning,
      poem: gift.poem,
      timestamp: Date.now(),
      personId: gift.personId || null,
      hidden: gift.hidden || false
    });
    return id;
  } catch (error) {
    console.error('Error saving gift:', error);
    return null;
  }
};

// Get all gifts for a person
export const getGiftsByPersonId = async (personId: string, includeHidden = false): Promise<Gift[]> => {
  try {
    const giftsRef = collection(db, GIFTS_COLLECTION);
    const q = query(
      giftsRef,
      where('personId', '==', personId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);

    const gifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Gift));

    if (includeHidden) {
      return gifts;
    }
    return gifts.filter(g => !g.hidden);
  } catch (error) {
    console.error('Error fetching gifts by personId:', error);
    return [];
  }
};

// Toggle gift hidden status
export const toggleGiftHidden = async (giftId: string, hidden: boolean): Promise<boolean> => {
  try {
    const docRef = doc(db, GIFTS_COLLECTION, giftId);
    await updateDoc(docRef, { hidden });
    return true;
  } catch (error) {
    console.error('Error toggling gift hidden:', error);
    return false;
  }
};

// Delete a gift
export const deleteGift = async (giftId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, GIFTS_COLLECTION, giftId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting gift:', error);
    return false;
  }
};
