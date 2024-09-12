// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxqmib7hU2w9zhg1nrnxkvnraRvvxNO4w",
  authDomain: "nocintern-5d0a2.firebaseapp.com",
  projectId: "nocintern-5d0a2",
  storageBucket: "nocintern-5d0a2.appspot.com",
  messagingSenderId: "343472071057",
  appId: "1:343472071057:web:a6a82889870b6afdb9ba30",
  measurementId: "G-CR8XN1ZLKS",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
