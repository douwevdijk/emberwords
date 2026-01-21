import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { UserMemory, Comment } from './types';

const MEMORIES_COLLECTION = 'memories';
const COMMENTS_COLLECTION = 'comments';

// Save a new memory
export const saveMemory = async (memory: Omit<UserMemory, 'id' | 'timestamp'>): Promise<string | null> => {
  try {
    console.log('Saving memory:', memory);

    // Prepare data - ensure no undefined values
    const memoryData = {
      cardId: memory.cardId,
      userName: memory.userName,
      text: memory.text,
      userLocation: {
        lat: memory.userLocation.lat,
        lng: memory.userLocation.lng,
        name: memory.userLocation.name || null
      },
      mediaUrl: memory.mediaUrl || null,
      mediaType: memory.mediaType || 'none',
      timestamp: Timestamp.now()
    };

    console.log('Memory data prepared:', memoryData);

    const docRef = await addDoc(collection(db, MEMORIES_COLLECTION), memoryData);
    console.log('Memory saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving memory:', error);
    return null;
  }
};

// Get all memories for a specific word card
export const getMemoriesByCardId = async (cardId: string): Promise<UserMemory[]> => {
  try {
    const memoriesRef = collection(db, MEMORIES_COLLECTION);
    const q = query(
      memoriesRef,
      where('cardId', '==', cardId),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    } as UserMemory));
  } catch (error) {
    console.error('Error fetching memories:', error);
    return [];
  }
};

// Get all memories (for world map)
export const getAllMemories = async (): Promise<UserMemory[]> => {
  try {
    const memoriesRef = collection(db, MEMORIES_COLLECTION);
    const q = query(memoriesRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    } as UserMemory));
  } catch (error) {
    console.error('Error fetching all memories:', error);
    return [];
  }
};

// Get a single memory by ID
export const getMemoryById = async (id: string): Promise<UserMemory | null> => {
  try {
    const docRef = doc(db, MEMORIES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        timestamp: docSnap.data().timestamp?.toMillis() || Date.now()
      } as UserMemory;
    }
    return null;
  } catch (error) {
    console.error('Error fetching memory:', error);
    return null;
  }
};

// Add a comment to a memory
export const addCommentToMemory = async (
  memoryId: string,
  comment: { userName: string; text: string }
): Promise<boolean> => {
  try {
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      memoryId,
      userName: comment.userName,
      text: comment.text,
      timestamp: Timestamp.now()
    });
    return true;
  } catch (error) {
    console.error('Error adding comment:', error);
    return false;
  }
};

// Get comments for a memory
export const getCommentsForMemory = async (memoryId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(
      commentsRef,
      where('memoryId', '==', memoryId)
    );
    const snapshot = await getDocs(q);

    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    } as Comment));

    // Sort client-side (ascending by timestamp)
    return comments.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Get all comments (for admin)
export const getAllComments = async (): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const snapshot = await getDocs(commentsRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toMillis() || Date.now()
    } as Comment));
  } catch (error) {
    console.error('Error fetching all comments:', error);
    return [];
  }
};

// Delete a memory
export const deleteMemory = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, MEMORIES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting memory:', error);
    return false;
  }
};

// Delete a comment
export const deleteComment = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    return false;
  }
};
