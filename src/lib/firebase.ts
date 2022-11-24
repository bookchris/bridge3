import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { firebaseConfig } from "./firebaseConfig";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth(getApp());
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(getApp());
export const functions = getFunctions(getApp());
