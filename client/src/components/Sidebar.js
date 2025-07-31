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

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
            boxShadow: 'none',
            color: '#666',
            fontSize: '18px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f5f5f5';
            e.target.style.color = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#666';
          }}
        />
        <Drawer
          placement="left"
          onClose={() => setMobileOpen(false)}
          open={mobileOpen}
          width={250}
          closable={false}
          title={null}
          extra={
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#262626',
              paddingLeft: '40px',
              width: '100%',
              textAlign: 'left'
            }}>
              메뉴
            </div>
          }
          styles={{
            body: { 
              padding: 0,
              paddingTop: '40px', // 메뉴 아이콘과 겹치지 않도록 상단 패딩 추가
            },
            header: { 
              background: '#fff',
              borderBottom: '1px solid #f0f0f0',
              padding: '16px 24px',
            },
            wrapper: {
              zIndex: 1002,
            }
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
        </Drawer>
      </>
    );
  }

  // 데스크톱용 사이드바
  return (
    <Sider
      width={250}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        position: 'fixed',
        left: 0,
        top: 64, // 헤더 높이
        height: 'calc(100vh - 64px)',
        zIndex: 1000,
      }}
      breakpoint="lg"
      collapsedWidth="0"
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