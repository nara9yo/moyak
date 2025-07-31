import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Button, Space, Typography, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SunOutlined, 
  MoonOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
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
        background: colors.surface,
        color: colors.text,
        padding: isMobile ? '0 16px 0 60px' : '0 24px',
        boxShadow: colors.shadow,
        zIndex: 1000,
        height: '64px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        borderBottom: `1px solid ${colors.border}`,
      }}
      className="theme-transition"
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Text
          style={{
            margin: 0,
            background: colors.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
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

      <Space size="middle">
        {/* 다크모드 토글 버튼 */}
        <Tooltip title={isDarkMode ? '라이트모드로 전환' : '다크모드로 전환'}>
          <Button
            type="text"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{
              color: colors.text,
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              boxShadow: 'none',
            }}
            className="modern-button"
          />
        </Tooltip>

        {/* 사용자 메뉴 */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
          overlayStyle={{
            marginTop: '0px', // 팝업 메뉴와 아바타 사이 간격을 최소화
          }}
        >
          <Button
            type="text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: 'auto',
              padding: '8px 12px',
              color: colors.text,
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              boxShadow: 'none',
            }}
            className="modern-button"
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