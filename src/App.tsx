import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Dashboard from './pages/dashboard/dashboard';
import ProtectedRoute from './components/route/protected-route';
import { AuthProvider } from './context/auth-context';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { TermsOfService } from './pages/help/terms-of-service/terms-of-service';
import { PrivacyPolicy } from './pages/help/privacy-policy/privacy-policy';
import { Header } from 'antd/es/layout/layout';
import AppLogo from './components/logo/logo';
import { Menu } from 'antd';
import './App.scss';


function App() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const installation_id = urlParams.get('installation_id');
    const setup_action = urlParams.get('setup_action');
    console.log(`code: ${code}, installation_id: ${installation_id}, setup_action: ${setup_action}`);
  });


  const menuItems = () => {
    return (
      <Menu theme="dark" mode="horizontal" selectable={true} inlineCollapsed={false}>
          <Menu.Item key="1">
            <Link to="/terms-of-service">
              Terms of Service
            </Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/privacy-policy">
              Privacy Policy
            </Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/contact-us">
              Contact Us
            </Link>
          </Menu.Item>
        </Menu>
    )
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Header className="app-header">
            <Link to="/login">
              <AppLogo/>
            </Link>
            {menuItems()}
          </Header>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
            <Route path="/terms-of-service" element={<TermsOfService/>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
