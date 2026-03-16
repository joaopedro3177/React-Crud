// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // 1. Importação da Autenticação adicionada

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQE7gpu4GUsfgbNLWuH96_KhhHeKaWKQI",
  authDomain: "meu-crud-firebase.firebaseapp.com",
  projectId: "meu-crud-firebase",
  storageBucket: "meu-crud-firebase.firebasestorage.app",
  messagingSenderId: "836291291223",
  appId: "1:836291291223:web:6825341388ac6bb04b1b12",
  measurementId: "G-H1N7X9FZHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportando os serviços para usar no App.jsx
export const db = getDatabase(app);
export const auth = getAuth(app); // 2. Exportação da Autenticação adicionada
