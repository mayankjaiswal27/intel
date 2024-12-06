// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBapsIfy7Z-k7jfPpcA0RBT_kkGQLZPZVU",
  authDomain: "intel-88cee.firebaseapp.com",
  projectId: "intel-88cee",
  storageBucket: "intel-88cee.firebasestorage.app",
  messagingSenderId: "480399588527",
  appId: "1:480399588527:web:7217d0e3f1c17d69a1285a",
  measurementId: "G-C22V0TNFPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);