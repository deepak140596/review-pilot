import './login.scss';
import { Button, Card, Input, Layout } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import {useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useEffect, useState } from 'react';

const Login = () => {

  const navigate = useNavigate();
  const { loginWithGitHub, loginWithEmailPassword, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  })

  const handleLogin = () => {
    loginWithGitHub().then(() => {
      navigate('/dashboard');
    }).catch(error => {
      console.error('Login failed:', error);
    });
  }

  const handleEmailLogin = async () => {
    console.log('Email:', email, 'Password:', password);
    await loginWithEmailPassword(email, password);
  }

  const emailLogin = () => {
    return (
      <Card className="login-card">
        <p className="login-intro">
          You will be authenticated through Email.
        </p>
        
        <Input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <Input.Password placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <Button
          type="primary"
          onClick={handleEmailLogin}>
          Login with Email
          </Button>
      </Card>
    )
  }

  return (
    <Layout className="layout">
      <Content className="login-container">
      {emailLogin()}
        <Card className="login-card">
          <p className="login-intro">
            You will be authenticated through GitHub.
          </p>
          <Button
            type="primary"
            icon={<GithubOutlined />}
            onClick={handleLogin}
            className="login-button"
          >
            Login with GitHub
          </Button>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;

