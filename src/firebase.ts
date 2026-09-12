import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import configData from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Specify custom firestore database ID from config if configured
export const db = getFirestore(app, configData.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export default app;
