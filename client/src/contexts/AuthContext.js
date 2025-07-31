import React, { createContext, useContext, useState, useEffect } from 'react';
import { App } from 'antd';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const { message: appMessage } = App.useApp();

  // API 인터셉터 설정
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 초기 사용자 정보 로드
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      // 실제 API 호출
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      appMessage.success('로그인이 완료되었습니다.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
      appMessage.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      // 실제 API 호출
      const response = await api.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      appMessage.success('회원가입이 완료되었습니다.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '회원가입에 실패했습니다.';
      appMessage.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    appMessage.success('로그아웃되었습니다.');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 