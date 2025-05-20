import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCkfXjwzLlsBzqvRv2TbKdiL8qIRJqrJGs',
  authDomain: 'metahub-25cd4.firebaseapp.com',
  projectId: 'metahub-25cd4',
  storageBucket: 'metahub-25cd4.appspot.com',
  messagingSenderId: '191257001803',
  appId: '1:191257001803:android:72e9daf55dd076aa21f2ce',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);