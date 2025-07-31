import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
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

  // 개발 모드 확인
  const isDevelopment = process.env.NODE_ENV === 'development';

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
          // 개발 모드에서 모의 토큰인 경우 localStorage에서 사용자 정보 로드
          if (isDevelopment && token.includes('mock-token')) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setLoading(false);
                return;
              } catch (e) {
                console.error('사용자 정보 파싱 실패:', e);
              }
            }
          }

          const response = await api.get('/api/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('사용자 정보 로드 실패:', error);
          // 개발 모드에서는 에러를 무시하고 계속 진행
          if (!isDevelopment) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token, isDevelopment]);

  const login = async (email, password) => {
    try {
      // 개발 모드에서 백엔드가 없을 때를 위한 모의 로그인
      if (isDevelopment && (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL === 'http://localhost:5000')) {
        // 테스트용 계정 확인
        const testUsers = {
          'admin@moyak.com': {
            id: 1,
            email: 'admin@moyak.com',
            name: '관리자',
            role: 'admin',
            timezone: 'Asia/Seoul'
          },
          'user@moyak.com': {
            id: 2,
            email: 'user@moyak.com',
            name: '일반 사용자',
            role: 'user',
            timezone: 'Asia/Seoul'
          }
        };

        const userData = testUsers[email];
        if (userData && (email === 'admin@moyak.com' && password === 'admin123' || 
                        email === 'user@moyak.com' && password === 'user123')) {
          const mockToken = `mock-token-${Date.now()}-${userData.id}`;
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(userData));
          setToken(mockToken);
          setUser(userData);
          
          message.success(`${userData.name}으로 로그인되었습니다. (개발 모드)`);
          return { success: true };
        } else {
          throw new Error('잘못된 이메일 또는 비밀번호입니다.');
        }
      }

      // 실제 API 호출
      const response = await api.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      message.success('로그인이 완료되었습니다.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '로그인에 실패했습니다.';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      // 개발 모드에서 백엔드가 없을 때를 위한 모의 회원가입
      if (isDevelopment && (!process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL === 'http://localhost:5000')) {
        const mockToken = `mock-token-${Date.now()}`;
        const newUser = {
          id: Date.now(),
          email: userData.email,
          name: userData.name,
          role: 'user',
          timezone: userData.timezone || 'Asia/Seoul'
        };
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(mockToken);
        setUser(newUser);
        
        message.success('회원가입이 완료되었습니다. (개발 모드)');
        return { success: true };
      }

      // 실제 API 호출
      const response = await api.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      message.success('회원가입이 완료되었습니다.');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '회원가입에 실패했습니다.';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    message.success('로그아웃되었습니다.');
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
    isDevelopment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 