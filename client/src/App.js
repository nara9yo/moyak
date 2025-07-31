import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './contexts/AuthContext';
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

  // 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <AuthProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
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
              <Layout>
                <Header />
                <Sidebar />
                <Layout style={{ 
                  padding: '24px',
                  margin: 0,
                  marginLeft: isMobile ? 0 : '250px', // 데스크톱에서만 사이드바 너비만큼 여백
                  marginTop: '64px', // 헤더 높이만큼 상단 여백
                }}>
                  <Content style={{ 
                    background: '#fff', 
                    padding: 24, 
                    margin: 0, 
                    minHeight: 280,
                    borderRadius: '8px',
                    overflow: 'hidden'
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
  );
}

export default App; 