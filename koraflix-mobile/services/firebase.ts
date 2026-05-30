import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "summer-plane-ncf5x",
  appId: "1:1033942412327:web:ca5510a509d2a801c07202",
  apiKey: "AIzaSyCci-jhje_WYw9AGvPf3R5344W20-acEhY",
  authDomain: "summer-plane-ncf5x.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-b1241537-0b56-4f52-a4b9-ac0943cc89b9",
  storageBucket: "summer-plane-ncf5x.firebasestorage.app",
  messagingSenderId: "1033942412327",
  measurementId: ""
};

let app;
let db;
let auth;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* Unified Firestore schema reference */
  console.log("🔥 KoraFlix Mobile: Firebase Connected successfully!");
} catch (error) {
  console.error("⚠️ KoraFlix Mobile Firebase Error:", error);
}

export { app, db, auth };
