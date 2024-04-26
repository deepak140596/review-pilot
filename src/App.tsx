import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Dashboard from './pages/dashboard/dashboard';
import ProtectedRoute from './components/route/protected-route';
import { AuthProvider } from './context/auth-context';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const installation_id = urlParams.get('installation_id');
    const setup_action = urlParams.get('setup_action');
    console.log(`code: ${code}, installation_id: ${installation_id}, setup_action: ${setup_action}`);
  });
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
