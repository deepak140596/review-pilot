import './login.scss';
import { Button, Card, Layout, Menu } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Content, Header } from 'antd/es/layout/layout';
import AppLogo from '../../components/logo/logo';
import { useNavigate } from 'react-router-dom';
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
      <Header className="header">
        <AppLogo />
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="1">Docs</Menu.Item>
          <Menu.Item key="2">Blog</Menu.Item>
          <Menu.Item key="3">Pricing</Menu.Item>
        </Menu>
      </Header>
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

