import './login.scss';
import { Button, Card, Layout } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Content } from 'antd/es/layout/layout';
import {useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useEffect } from 'react';

const Login = () => {

  const navigate = useNavigate();
  const { loginWithGitHub, currentUser } = useAuth();

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

  return (
    <Layout className="layout">
      <Content className="login-container">
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

