// Use Firebase CDN ESM imports so this works without a bundler
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRMq5IZ7GuNffSO7HgQZL7vPG9leVHAZI",
  authDomain: "surplus-share-cabe6.firebaseapp.com",
  projectId: "surplus-share-cabe6",
  storageBucket: "surplus-share-cabe6.appspot.com",
  messagingSenderId: "33028455799",
  appId: "1:33028455799:web:00b184778a05e386887572",
  measurementId: "G-DMSLZJ828E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);
