import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  orderBy,
  query,
} from 'firebase/firestore';
import { Person } from './types';

const PERSONS_COLLECTION = 'persons';

// Generate a random admin token
const generateAdminToken = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

// Create a new person
export const createPerson = async (
  name: string,
  description: string,
  creatorEmail: string
): Promise<{ id: string; adminToken: string } | null> => {
  try {
    const id = `person-${Date.now()}`;
    const adminToken = generateAdminToken();

    const docRef = doc(db, PERSONS_COLLECTION, id);
    await setDoc(docRef, {
      name,
      description: description || null,
      creatorEmail,
      adminToken,
      timestamp: Date.now()
    });

    return { id, adminToken };
  } catch (error) {
    console.error('Error creating person:', error);
    return null;
  }
};

// Get a person by ID
export const getPersonById = async (id: string): Promise<Person | null> => {
  try {
    const docRef = doc(db, PERSONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Person;
    }
    return null;
  } catch (error) {
    console.error('Error fetching person:', error);
    return null;
  }
};

// Verify admin token
export const verifyAdminToken = async (personId: string, token: string): Promise<boolean> => {
  try {
    const person = await getPersonById(personId);
    return person?.adminToken === token;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return false;
  }
};

// Get all persons
export const getAllPersons = async (): Promise<Person[]> => {
  try {
    const personsRef = collection(db, PERSONS_COLLECTION);
    const q = query(personsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Person));
  } catch (error) {
    console.error('Error fetching all persons:', error);
    return [];
  }
};
