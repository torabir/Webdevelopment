import { collection, addDoc, updateDoc, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Advert } from '../logic/Advert';
import { db } from '../config/firebase';

// Henter alle byene fra Firestore
export const fetchCities = async (): Promise<string[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "cities"));
      return querySnapshot.docs.map((doc) => doc.data().name);
    } catch (error) {
      console.error("Feil ved henting av byer:", error);
      return [];
    }
  };