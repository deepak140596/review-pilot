import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import Dashboard from './pages/dashboard/dashboard';
import ProtectedRoute from './components/route/protected-route';
import { AuthProvider } from './context/auth-context';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { TermsOfService } from './pages/company/terms-of-service';
import { PrivacyPolicy } from './pages/company/privacy-policy';
import { Header } from 'antd/es/layout/layout';
import AppLogo from './components/logo/logo';
import './App.scss';
import { Footer } from './components/footer/footer';
import { RefundAndCancellation } from './pages/company/refund-and-cancellation';
import { AboutUs } from './pages/company/about-us';
import { ContactUs } from './pages/company/contact-us';
import { Docs } from './pages/docs/docs';
import { Shipping } from './pages/company/shipping';


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
          <Header className="app-header">
            <Link to="/login">
              <AppLogo/>
            </Link>
          </Header>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about-us" element={<AboutUs/>} />
            <Route path="/contact-us" element={<ContactUs/>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy/>} />
            <Route path="/terms-of-service" element={<TermsOfService/>} />
            <Route path="/refund" element={<RefundAndCancellation/>}/>
            <Route path="/shipping" element={<Shipping/>}/>
            <Route path="/docs" element={<Docs/>} />
            <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>

          <Footer/>
          
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;