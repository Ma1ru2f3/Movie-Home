// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJlhLhl-dFkZO9LP5s_0XMhtotiv3RMW8",
  authDomain: "movie-world-db6c9.firebaseapp.com",
  projectId: "movie-world-db6c9",
  storageBucket: "movie-world-db6c9.appspot.com",
  messagingSenderId: "801583543414",
  appId: "1:801583543414:web:42361e2894b9893c07db57",
  measurementId: "G-1ZY34TB1GC"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const db = getFirestore(app);
