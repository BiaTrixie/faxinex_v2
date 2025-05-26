// FirebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, signInWithCustomToken } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMZ7Mu_DsD5BYfHFyO6WWIwCcbXbEzjo0",
  authDomain: "faxinex-630ad.firebaseapp.com",
  projectId: "faxinex-630ad",
  storageBucket: "faxinex-630ad.firebasestorage.app",
  messagingSenderId: "508822075025",
  appId: "1:508822075025:web:ef77d415a3bc31ad233130"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

export { auth, firestore };
