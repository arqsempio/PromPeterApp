import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBRLySuwvjkHURbp89ngRd0E9JMh_Xatbw",
  authDomain: "prompeter-550b0.firebaseapp.com",
  databaseURL: "https://prompeter-550b0-default-rtdb.firebaseio.com",
  projectId: "prompeter-550b0",
  storageBucket: "prompeter-550b0.firebasestorage.app",
  messagingSenderId: "115512956813",
  appId: "1:115512956813:web:6eb246ec015f0984dc0fc4"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
