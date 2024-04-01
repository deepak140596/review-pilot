import './login.scss';
import { Button, Card, Layout, Menu } from 'antd';
import { GithubOutlined } from '@ant-design/icons';
import { Content, Header } from 'antd/es/layout/layout';
import AppLogo from '../../components/logo/logo';
import { GithubAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { setGithubToken } from '../../api/services/firestore/firestore-setter';
import { FirestoreService } from '../../api/services/firestore/firestore-service';

const Login = () => {

  const handleGitHubLogin = () => {
    const provider = new GithubAuthProvider();
    provider.addScope('repo');
    provider.setCustomParameters({
      allow_signup: 'false'
    });
    const auth = getAuth();

    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;

        FirestoreService.uid = user.uid;
        setGithubToken(token);

      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        const credential = GithubAuthProvider.credentialFromError(error);
        
      });

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

