import { Link } from 'react-router-dom';
import './login.scss';

const Login = () => {
  return (
    <div className="login">
      <h2>Login</h2>
      <Link to="/dashboard">Go to Dashboard</Link>
    </div>
  );
};

export default Login;
