// firebase-config.js

// Import the functions you need from the Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// Your web app's Firebase configuration (from the code you provided)
const firebaseConfig = {
  apiKey: "AIzaSyCUaz1wZX9CdvPP02vFeL9a6KYKyy8a-o8",
  authDomain: "wagydog-dating.firebaseapp.com",
  projectId: "wagydog-dating",
  storageBucket: "wagydog-dating.appspot.com", // I corrected this from your code, which had a typo
  messagingSenderId: "781604597180",
  appId: "1:781604597180:web:d35b4f153b66cf68ac4fb9",
  measurementId: "G-5R0G62HXF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export the services your app needs
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
