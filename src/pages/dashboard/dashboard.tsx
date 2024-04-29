import './dashboard.scss';
import { Button, Layout, Menu } from 'antd';
import {
  CodeOutlined,
  SettingOutlined,
  FileOutlined,
  BuildOutlined,
  DollarOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import AppLogo from '../../components/logo/logo';
import { useAuth } from '../../context/auth-context';
import { useEffect } from 'react';
import Repositories from './repositories/repositories';
import { Link, Route, Routes } from 'react-router-dom';
import ConfigureProject from '../configure/project/configure-project';
import ConfigureOrganisation from '../configure/organisation/configure-organisation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { subscribeToUserOrganisations } from '../../store/account-slice';

const { Header, Sider } = Layout;

const Dashboard = () => {
  const { logout } = useAuth();
  const { data: userOrganisations } = useSelector((state: RootState) => state.userOrganisations);
  const { data: userAccount } = useSelector((state: RootState) => state.userAccount);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userAccount) {
      dispatch(subscribeToUserOrganisations(userAccount.id))
    }
  },[dispatch, userAccount]);

  useEffect(() => {
    if (userOrganisations) {
      console.log(userOrganisations.length);
    }
  }, [userOrganisations]);

  const organisationsMenu = () => {
    if (!userOrganisations || !userAccount) return (<></>);
    return (
      <div>
        <Menu mode="inline" 
          defaultSelectedKeys={[`${userAccount?.id}`]}
          className='dashboard-sidebar-menu'>
          <Menu.Item key={userAccount?.id}>
            {userAccount?.full_name}
          </Menu.Item>

          {
            userOrganisations?.map((organisation) => {
              return (
                <Menu.Item key={organisation.id}>
                  {organisation.login}
                </Menu.Item>
              );
            })
          }
        </Menu>
      </div>
    );
  }

  return (
    <Layout className="dashboard-layout">

      <Header className="dashboard-header">
        <AppLogo/>
      </Header>

      <Layout>
        <Sider width={250} className='dashboard-sidebar'>
          <Menu
              mode='inline'
              defaultSelectedKeys={['2']}
              className="dashboard-sidebar-menu"
            >
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

          {/* separator line */}
          <div className='dashboard-sidebar-separator'></div>

          {organisationsMenu()}

          <div className='dashboard-sidebar-footer'>
            <Button block icon={<LogoutOutlined />} onClick={logout}>
              Logout
            </Button>
          </div>
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