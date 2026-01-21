import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { WordCard } from './types';

const WORDS_COLLECTION = 'words';

// Get all words from Firestore
export const getAllWords = async (): Promise<WordCard[]> => {
  try {
    const wordsRef = collection(db, WORDS_COLLECTION);
    const q = query(wordsRef, orderBy('word'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WordCard));
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
};

// Get a single word by ID
export const getWordById = async (id: string): Promise<WordCard | null> => {
  try {
    const docRef = doc(db, WORDS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as WordCard;
    }
    return null;
  } catch (error) {
    console.error('Error fetching word:', error);
    return null;
  }
};

// Save a word to Firestore
export const saveWord = async (word: WordCard): Promise<boolean> => {
  try {
    const docRef = doc(db, WORDS_COLLECTION, word.id);
    await setDoc(docRef, {
      word: word.word,
      country: word.country,
      shortDefinition: word.shortDefinition,
      question: word.question,
      pronunciation: word.pronunciation || null,
      deepDive: word.deepDive || null
    });
    return true;
  } catch (error) {
    console.error('Error saving word:', error);
    return false;
  }
};

// Delete a word from Firestore
export const deleteWord = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, WORDS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting word:', error);
    return false;
  }
};
