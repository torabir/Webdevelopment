import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage"; // fjernes

const firebaseConfig = {
    apiKey: "AIzaSyBNmigynUBIUlYiBnMPjvS5DHHWnLg-q2k",
    authDomain: "futleie-e92c0.firebaseapp.com",
    projectId: "futleie-e92c0",
    //storageBucket: "futleie-e92c0.firebasestorage.app",
    // storageBucket: "futleie-e92c0.appspot.com", // bruker ikke storage, ikke gratis i EU
    messagingSenderId: "584213673979",
    appId: "1:584213673979:web:f5f5fb5bf7e62d2ac4fd5e",
    measurementId: "G-1CJSPX0PXV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Handle Authentication 
export const auth = getAuth(app);

// Handle firestore
export const db = getFirestore(app);

//Lagring av bilder
// export const storage = getStorage(app); 