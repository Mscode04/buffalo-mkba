// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqD-HW_1JxGbMAYYTyHwMIsscfbT_HVHA",
  authDomain: "data-base-poth.firebaseapp.com",
  projectId: "data-base-poth",
  storageBucket: "data-base-poth.firebasestorage.app",
  messagingSenderId: "914727419550",
  appId: "1:914727419550:web:b8e6718171d0dd64d8858f",
  measurementId: "G-5LMQ30G9W0"
};

const FirebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(FirebaseApp);
