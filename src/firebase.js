// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQE7gpu4GUsfgbNLWuH96_KhhHeKaWKQI",
  authDomain: "meu-crud-firebase.firebaseapp.com",
  projectId: "meu-crud-firebase",
  storageBucket: "meu-crud-firebase.firebasestorage.app",
  messagingSenderId: "836291291223",
  appId: "1:836291291223:web:6825341388ac6bb04b1b12",
  measurementId: "G-H1N7X9FZHY"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);