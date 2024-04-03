import './dashboard.scss';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CodeOutlined,
  SettingOutlined,
  FileOutlined,
  BuildOutlined,
  DollarOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import AppLogo from '../../components/logo/logo';
import { useAuth } from '../../context/auth-context';
import { useEffect, useState } from 'react';
import Overview from './overview/overview';
import Repositories from './repositories/repositories';

const { Header, Sider } = Layout;

const Dashboard = () => {

  const { logout } = useAuth();
  const [activeComponent, setActiveComponent] = useState(<Overview />);

  const handleMenuClick = (component: JSX.Element) => {
    console.log('component', component);
    setActiveComponent(component);
  };

  

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <AppLogo/>
        <Menu theme="dark" mode="horizontal" selectable={false}>
          <Menu.Item key="1" onClick={logout} icon={<LogoutOutlined/>}>
            Logout
          </Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Sider width={200} className="dashboard-sidebar">
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            className="dashboard-sidebar__menu"
          >
            <Menu.Item key="1" 
              icon={<DashboardOutlined />}
              onClick={() => handleMenuClick(<Overview />)}>
              Overview
            </Menu.Item>
            <Menu.Item key="2" 
              icon={<CodeOutlined />} 
              onClick={() => handleMenuClick(<Repositories />)}>
              Repositories
            </Menu.Item>
            <Menu.Item key="3" 
              icon={<BuildOutlined />}>
              Integrations
            </Menu.Item>
            <Menu.Item key="4" 
              icon={<FileOutlined />}>
              Reports
            </Menu.Item>
            <Menu.Item key="5" 
              icon={<SettingOutlined />}>
              Organisation
            </Menu.Item>
            <Menu.Item key="6" 
              icon={<DollarOutlined />}>
              Subscription
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout className="dashboard-content">
          {activeComponent}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;