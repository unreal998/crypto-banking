import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBppU8Y-CeXkEdz-nYAswKq4RUIZ4XlZJ0",
  authDomain: "crypto-banking-b62b6.firebaseapp.com",
  databaseURL: "https://crypto-banking-b62b6-default-rtdb.firebaseio.com",
  projectId: "crypto-banking-b62b6",
  storageBucket: "crypto-banking-b62b6.appspot.com",
  messagingSenderId: "739317911628",
  appId: "1:739317911628:web:fc54f48e4f1833a22ea4e9"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);
export default database;