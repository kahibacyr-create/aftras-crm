
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { auth } from '../firebase-config';

export const authService = {
  // Add auth property to allow access to auth.currentUser in App.tsx
  auth,

  login: (email: string, pass: string) => 
    signInWithEmailAndPassword(auth, email, pass),

  register: (email: string, pass: string) => 
    createUserWithEmailAndPassword(auth, email, pass),

  logout: () => signOut(auth),

  sendResetEmail: (email: string) =>
    sendPasswordResetEmail(auth, email),

  getCurrentUser: (callback: (user: User | null) => void) => 
    onAuthStateChanged(auth, callback)
};
