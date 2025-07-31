import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  PlusOutlined,
  BookOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: '이벤트 관리',
    },
    {
      key: '/events/create',
      icon: <PlusOutlined />,
      label: '이벤트 생성',
    },
    {
      key: '/bookings',
      icon: <BookOutlined />,
      label: '예약 관리',
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '프로필',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/dashboard';
    if (path.startsWith('/events/') && path !== '/events/create') {
      return '/events';
    }
    return path;
  };

  return (
    <Sider
      width={250}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        style={{
          height: '100%',
          borderRight: 0,
          paddingTop: '16px',
        }}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
};

export default Sidebar; 