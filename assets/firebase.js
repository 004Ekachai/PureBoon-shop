import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (ของจริงของคุณ)
const firebaseConfig = {
  apiKey: "AIzaSyBDq5Nnfh_ozp4JKoS38UsjzrYNTKW0kjQ",
  authDomain: "pureboon-firebase.firebaseapp.com",
  projectId: "pureboon-firebase",
  storageBucket: "pureboon-firebase.firebasestorage.app",
  messagingSenderId: "287988948151",
  appId: "1:287988948151:web:71629f605937a76b914132",
  measurementId: "G-DSREDR8C8V"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
