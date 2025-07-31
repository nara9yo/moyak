import axios from 'axios';

// 개발 모드 확인
const isDevelopment = process.env.NODE_ENV === 'development';

// API 기본 설정
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 개발 모드에서 현재 사용자 이메일을 헤더에 추가
    if (isDevelopment) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) {
            config.headers['x-user-email'] = user.email;
          }
        } catch (e) {
          // JSON 파싱 오류 무시
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 로그인 요청일 때는 401 에러를 그대로 전달 (오류 메시지 표시를 위해)
    if (error.response?.status === 401 && error.config?.url?.includes('/api/auth/login')) {
      return Promise.reject(error);
    }
    
    // 401 에러 처리 (로그인 요청이 아닌 경우)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 