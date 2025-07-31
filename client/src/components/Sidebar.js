import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  PlusOutlined,
  BookOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return '/dashboard';
    if (path.startsWith('/events/') && path !== '/events/create') {
      return '/events';
    }
    return path;
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // 모바일용 드로어
  if (isMobile) {
    return (
      <>
        <Button
          type="text"
          icon={mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={toggleMobileMenu}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 1001,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            boxShadow: colors.shadow,
            color: colors.text,
            fontSize: '18px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="modern-button"
        />

        <Drawer
          title={
            <div style={{ 
              paddingLeft: '40px', 
              width: '100%', 
              textAlign: 'left',
              color: colors.text,
              fontWeight: 'bold',
            }}>
              메뉴
            </div>
          }
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          width={280}
          styles={{
            header: {
              background: colors.surface,
              borderBottom: `1px solid ${colors.border}`,
            },
            body: {
              background: colors.surface,
              padding: 0,
            },
            wrapper: {
              zIndex: 1002,
            },
          }}
          className="theme-transition"
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              background: colors.surface,
              color: colors.text,
              border: 'none',
              paddingTop: '40px',
            }}
            className="theme-transition"
          />
        </Drawer>
      </>
    );
  }

  // 데스크톱용 사이드바
  return (
    <Sider
      width={250}
      style={{
        background: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 999,
        paddingTop: '64px',
        boxShadow: colors.shadow,
      }}
      className="theme-transition"
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: colors.surface,
          color: colors.text,
          border: 'none',
          height: '100%',
        }}
        className="theme-transition"
      />
    </Sider>
  );
};

export default Sidebar; 