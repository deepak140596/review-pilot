import './login.scss';
import { Button, Card, Layout, Menu } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Content, Header } from 'antd/es/layout/layout';
import AppLogo from '../../components/logo/logo';
import { useEffect } from 'react';

const Login = () => {

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    console.log(`code: ${code}`);
  });

  const handleGitHubLogin = () => {
    const clientId = "";
    console.log(`clientId: ${clientId}`);
    const githubLoginLink = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${clientId}`;
    window.location.href = githubLoginLink;
  };

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
            onClick={handleGitHubLogin}
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

