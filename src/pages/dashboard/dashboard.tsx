import './dashboard.scss';
import { Button, Layout, Menu } from 'antd';
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
import { useState } from 'react';
import Overview from './overview/overview';
import Repositories from './repositories/repositories';
import { Link, Route, Routes } from 'react-router-dom';
import ConfigureProject from '../configure/project/configure-project';
import ConfigureOrganisation from '../configure/organisation/configure-organisation';

const { Header, Sider } = Layout;

const Dashboard = () => {
  const { logout } = useAuth();

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
        <Sider width={250} className="dashboard-sidebar">
          <Menu
            mode="inline"
            defaultSelectedKeys={['2']}
            className="dashboard-sidebar-menu"
          >
            {/* <Menu.Item key="1" 
              icon={<DashboardOutlined />}
              onClick={() => handleMenuClick(<Overview />)}>
              Overview
            </Menu.Item> */}
            <Menu.Item key="2" 
              icon={<CodeOutlined />} >
                <Link to="/dashboard/repositories">Repositories</Link>
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
              <Link to="/dashboard/organisation">Organisation</Link>
            </Menu.Item>
            <Menu.Item key="6" 
              icon={<DollarOutlined />}>
              Subscription
            </Menu.Item>
          </Menu>

          {/* <div className="dashboard-sidebar-footer">
            <Button block icon={<LogoutOutlined />} onClick={logout}>
              Logout
            </Button>
          </div> */}
        </Sider>

        <Layout className="dashboard-content">
          <Routes>
            <Route path="/" element={<Repositories />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/configure-project/:projectId" element={<ConfigureProject />} />
            <Route path="/organisation" element={<ConfigureOrganisation />} />
          </Routes>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;