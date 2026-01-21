import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB9L73dyPoocEJ1_ApEmLuc5tjwixffwKc",
  authDomain: "me-do.firebaseapp.com",
  databaseURL: "https://me-do.firebaseio.com",
  projectId: "firebase-me-do",
  storageBucket: "firebase-me-do.appspot.com",
  messagingSenderId: "1012066892690",
  appId: "1:1012066892690:web:e63e369e7ad96d296edf4b",
  measurementId: "G-Z5GXRXQWKZ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const storage = getStorage(app);
