import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase-config';

export const dbService = {
  getAll: async (collectionName: string) => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      if (error?.code !== 'unavailable' && error?.code !== 'permission-denied') {
        console.error(`Erreur collection ${collectionName}:`, error);
      }
      return []; 
    }
  },

  getById: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error: any) {
      if (error?.code === 'permission-denied' && id === 'app_config') {
        return null;
      }
      if (error?.code !== 'unavailable') {
        console.error(`Erreur document ${id}:`, error);
      }
      return null;
    }
  },

  listenById: (collectionName: string, id: string, callback: (data: any) => void) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error(`Erreur écoute document ${id}:`, error);
      }
      callback(null);
    });
  },

  add: async (collectionName: string, data: any) => {
    try {
      if (data.id) {
        const { id, ...rest } = data;
        const docRef = doc(db, collectionName, id);
        await setDoc(docRef, rest);
        return { id };
      }
      return await addDoc(collection(db, collectionName), data);
    } catch (error) {
      console.error(`Erreur ajout ${collectionName}:`, error);
      throw error;
    }
  },

  update: async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      return await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Erreur mise à jour ${id}:`, error);
      throw error;
    }
  },

  delete: async (collectionName: string, id: string) => {
    try {
      return await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Erreur suppression ${id}:`, error);
      throw error;
    }
  },

  getByQuery: async (collectionName: string, field: string, operator: any, value: any) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error: any) {
      if (error?.code !== 'unavailable' && error?.code !== 'permission-denied') {
        console.error(`Erreur requête ${collectionName}:`, error);
      }
      return [];
    }
  }
};