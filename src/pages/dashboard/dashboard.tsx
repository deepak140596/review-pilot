import { Link } from 'react-router-dom';
import './dashboard.scss';
import { useAuth } from '../../context/auth-context';

const Dashboard = () => {
  const { logout } = useAuth();
  return (
    <div className="dashboard">
      <h2>Dasboard</h2>
      <button onClick={
        () => {
          logout();
          console.log('Logout clicked');
        }
      } >Logout</button>
    </div>
  );
};

export default Dashboard;
