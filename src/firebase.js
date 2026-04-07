import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQE7gpu4GUsfgbNLWuH96_KhhHeKaWKQI",
  authDomain: "meu-crud-firebase.firebaseapp.com",
  projectId: "meu-crud-firebase",
  storageBucket: "meu-crud-firebase.appspot.com",
  messagingSenderId: "836291291223",
  appId: "1:836291291223:web:6825341388ac6bb04b1b12"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);