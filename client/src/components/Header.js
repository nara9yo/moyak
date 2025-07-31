import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Button, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: isMobile ? '0 16px 0 60px' : '0 24px', // 모바일에서 왼쪽 여백 추가
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        height: '64px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text
          style={{
            margin: 0,
            color: '#1890ff',
            fontSize: '24px',
            fontWeight: 'bold',
            cursor: 'pointer',
            lineHeight: 1,
          }}
          onClick={() => navigate('/dashboard')}
        >
          <span className="hidden-xs">모약 (MOYAK)</span>
          <span className="visible-xs">MOYAK</span>
        </Text>
      </div>

      <Space>
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
        >
          <Button
            type="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: 'auto',
              padding: '8px 12px',
            }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={user?.profile_image}
            />
            <span className="hidden-xs">
              {user?.name}
            </span>
          </Button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header; 