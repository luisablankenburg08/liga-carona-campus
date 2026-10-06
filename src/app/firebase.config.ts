import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDL3NLPlBarNeA550if2BgvgRjGsiYE52w",
  authDomain: "carona-campus-d033f.firebaseapp.com",
  projectId: "carona-campus-d033f",
  storageBucket: "carona-campus-d033f.firebasestorage.app",
  messagingSenderId: "375253162647",
  appId: "1:375253162647:web:859b873374c7a96b72e7d2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

