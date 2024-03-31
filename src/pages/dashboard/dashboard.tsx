import { Link } from 'react-router-dom';
import './dashboard.scss';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Dasboard</h2>
      <Link to="/login">Go to Dashboard</Link>
    </div>
  );
};

export default Dashboard;
