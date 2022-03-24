import { initializeApp } from "firebase/app";
import { initializeFirestore, collection } from "firebase/firestore";
import accessEnv from "../util/accessEnv";

const firebaseConfig = {
  apiKey: accessEnv("FIREBASE_API_KEY"),
  authDomain: accessEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: accessEnv("FIREBASE_PROJECT_ID"),
  storageBucket: accessEnv("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: accessEnv("FIREBASE_MESSAGING_SENDER"),
  appId: accessEnv("FIREBASE_APP_ID"),
  measurementId: accessEnv("FIREBASE_MEASUREMENT_ID"),
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {});
const Words = collection(db, "learnedWords");
const Playlists = collection(db, "playlists");
const Songs = collection(db, "songs");
const PSC = collection(db, "playlist-song-connection");

module.exports = { Words, Playlists, Songs, PSC, db };
