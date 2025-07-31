import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, theme, App as AntApp } from 'antd';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// 페이지 컴포넌트들
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventCreate from './pages/EventCreate';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import BookingList from './pages/BookingList';
import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import PublicBooking from './pages/PublicBooking';

const { Content } = Layout;

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, colors } = useTheme();

  // 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Ant Design 테마 설정
  const antdTheme = {
    token: {
      colorPrimary: colors.primary,
      colorSuccess: colors.success,
      colorWarning: colors.warning,
      colorError: colors.error,
      colorInfo: colors.info,
      borderRadius: 12,
      wireframe: false,
    },
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <AuthProvider>
          <Layout 
            style={{ 
              minHeight: '100vh',
              background: colors.background,
              color: colors.text,
            }}
            data-theme={isDarkMode ? 'dark' : 'light'}
            className="theme-transition"
          >
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: isDarkMode ? colors.card : colors.surface,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  boxShadow: colors.shadow,
                },
              }}
            />
            
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking/:bookingLink" element={<PublicBooking />} />
              
              {/* 보호된 라우트 */}
              <Route path="/*" element={
                <PrivateRoute>
                  <Layout style={{ background: colors.background }}>
                    <Header />
                    <Sidebar />
                    <Layout style={{ 
                      padding: '24px',
                      margin: 0,
                      marginLeft: isMobile ? 0 : '250px',
                      marginTop: '64px',
                      background: colors.background,
                    }}>
                      <Content style={{ 
                        background: colors.surface, 
                        padding: 24, 
                        margin: 0, 
                        minHeight: 280,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: colors.shadow,
                        border: `1px solid ${colors.border}`,
                      }}>
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/events" element={<EventList />} />
                          <Route path="/events/create" element={<EventCreate />} />
                          <Route path="/events/:id" element={<EventDetail />} />
                          <Route path="/bookings" element={<BookingList />} />
                          <Route path="/bookings/:id" element={<BookingDetail />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </Content>
                    </Layout>
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </Layout>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App; 