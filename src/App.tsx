import './App.css';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Dashboard from './pages/dashboard/dashboard';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-xIPfXGXpodGyGcFHh4VbHnantzh9AhY",
  authDomain: "pr-review-bot.firebaseapp.com",
  projectId: "pr-review-bot",
  storageBucket: "pr-review-bot.appspot.com",
  messagingSenderId: "735766966982",
  appId: "1:735766966982:web:8ee3f68e26652516a41dc7",
  measurementId: "G-GV0GQKV03S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
