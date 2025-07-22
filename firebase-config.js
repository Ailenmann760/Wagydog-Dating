// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// =================================================================
// TODO: Replace the object below with your app's Firebase project configuration
// Go to your Project Settings > General > Your apps > SDK setup and configuration
// =================================================================
const firebaseConfig = {
  // PASTE YOUR CONFIG OBJECT FROM THE FIREBASE CONSOLE HERE
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};
// =================================================================
// END OF SECTION TO REPLACE
// =================================================================


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services to be used in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
