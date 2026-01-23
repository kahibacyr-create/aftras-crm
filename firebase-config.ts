// Initialize Firebase using modular SDK patterns
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';

// Configuration Firebase réelle du projet AFTRAS
const firebaseConfig = {
  apiKey: "AIzaSyAwhQ9nr9mDn1SmWAuJrvioLqfIi3Bjyeg",
  authDomain: "aftras-c1b74.firebaseapp.com",
  projectId: "aftras-c1b74",
  storageBucket: "aftras-c1b74.firebasestorage.app",
  messagingSenderId: "151673073567",
  appId: "1:151673073567:web:39ad3f206dcb5a87ecd7aa",
  measurementId: "G-7G51QYFMF6"
};

// Initialisation de l'instance Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialisation de Firestore avec cache local persistant pour le support PWA multi-onglets
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});