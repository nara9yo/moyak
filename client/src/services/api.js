import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 개발 모드 확인
const isDevelopment = process.env.NODE_ENV === 'development';

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // 개발 모드에서는 401 에러를 조용히 처리
    if (error.response?.status === 401) {
      if (!isDevelopment) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        // 개발 모드에서는 401 에러를 무시하고 모의 API 사용
        console.log('개발 모드: 401 에러 무시, 모의 API 사용');
      }
    }
    return Promise.reject(error);
  }
);

// 개발 모드에서 백엔드가 없을 때를 위한 모의 API 응답
if (isDevelopment) {
  // 현재 사용자 정보 가져오기
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // 모의 데이터
  const mockData = {
    admin: {
      events: [
        {
          id: 1,
          title: '상담 미팅',
          description: '고객 상담을 위한 미팅',
          duration: 30,
          location_type: 'online',
          location_details: 'Zoom',
          is_active: true,
          booking_link: 'consultation-meeting',
          created_at: '2024-01-15T10:00:00Z',
          availabilities: [
            { id: 1, day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00' },
            { id: 2, day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00' },
            { id: 3, day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00' }
          ]
        },
        {
          id: 2,
          title: '제품 데모',
          description: '신제품 소개 및 데모',
          duration: 60,
          location_type: 'in_person',
          location_details: '회사 회의실',
          is_active: true,
          booking_link: 'product-demo',
          created_at: '2024-01-16T14:00:00Z',
          availabilities: [
            { id: 4, day_of_week: 4, start_time: '10:00:00', end_time: '18:00:00' },
            { id: 5, day_of_week: 5, start_time: '10:00:00', end_time: '18:00:00' }
          ]
        }
      ],
      bookings: [
        {
          id: 1,
          event_id: 1,
          guest_name: '김철수',
          guest_email: 'kim@example.com',
          scheduled_at: '2024-01-20T10:00:00Z',
          status: 'confirmed',
          created_at: '2024-01-18T09:00:00Z'
        },
        {
          id: 2,
          event_id: 2,
          guest_name: '이영희',
          guest_email: 'lee@example.com',
          scheduled_at: '2024-01-22T14:00:00Z',
          status: 'pending',
          created_at: '2024-01-19T11:00:00Z'
        }
      ],
      dashboard: {
        totalEvents: 2,
        totalBookings: 2,
        pendingBookings: 1,
        confirmedBookings: 1,
        recentBookings: [
          {
            id: 2,
            guest_name: '이영희',
            event_title: '제품 데모',
            scheduled_at: '2024-01-22T14:00:00Z',
            status: 'pending'
          }
        ],
        upcomingEvents: [
          {
            id: 1,
            title: '상담 미팅',
            next_booking: '2024-01-20T10:00:00Z'
          }
        ]
      }
    },
    user: {
      events: [
        {
          id: 3,
          title: '개인 상담',
          description: '개인 상담 세션',
          duration: 45,
          location_type: 'online',
          location_details: 'Google Meet',
          is_active: true,
          booking_link: 'personal-consultation',
          created_at: '2024-01-17T09:00:00Z',
          availabilities: [
            { id: 6, day_of_week: 1, start_time: '14:00:00', end_time: '18:00:00' },
            { id: 7, day_of_week: 3, start_time: '14:00:00', end_time: '18:00:00' }
          ]
        }
      ],
      bookings: [
        {
          id: 3,
          event_id: 3,
          guest_name: '박민수',
          guest_email: 'park@example.com',
          scheduled_at: '2024-01-25T15:00:00Z',
          status: 'confirmed',
          created_at: '2024-01-20T10:00:00Z'
        }
      ],
      dashboard: {
        totalEvents: 1,
        totalBookings: 1,
        pendingBookings: 0,
        confirmedBookings: 1,
        recentBookings: [
          {
            id: 3,
            guest_name: '박민수',
            event_title: '개인 상담',
            scheduled_at: '2024-01-25T15:00:00Z',
            status: 'confirmed'
          }
        ],
        upcomingEvents: [
          {
            id: 3,
            title: '개인 상담',
            next_booking: '2024-01-25T15:00:00Z'
          }
        ]
      }
    }
  };

  // 모의 API 메서드들
  const mockApi = {
    get: (url) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentUser = getCurrentUser();
          const userType = currentUser?.role === 'admin' ? 'admin' : 'user';
          const userData = mockData[userType];

          if (url.includes('/api/events')) {
            resolve({ data: userData.events });
          } else if (url.includes('/api/bookings')) {
            resolve({ data: userData.bookings });
          } else if (url.includes('/api/dashboard')) {
            resolve({ data: userData.dashboard });
          } else if (url.includes('/api/auth/me')) {
            const token = localStorage.getItem('token');
            if (token && token.includes('mock-token')) {
              resolve({ 
                data: { 
                  user: currentUser || {
                    id: 1,
                    email: 'admin@moyak.com',
                    name: '관리자',
                    role: 'admin'
                  }
                } 
              });
            } else {
              throw new Error('Unauthorized');
            }
          } else {
            resolve({ data: [] });
          }
        }, 500); // 0.5초 지연으로 실제 API 호출 시뮬레이션
      });
    },
    post: (url, data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentUser = getCurrentUser();
          const userType = currentUser?.role === 'admin' ? 'admin' : 'user';
          const userData = mockData[userType];

          if (url.includes('/api/events')) {
            const newEvent = {
              id: Date.now(),
              ...data,
              created_at: new Date().toISOString(),
              booking_link: `event-${Date.now()}`
            };
            userData.events.push(newEvent);
            resolve({ data: newEvent });
          } else if (url.includes('/api/bookings')) {
            const newBooking = {
              id: Date.now(),
              ...data,
              created_at: new Date().toISOString(),
              status: 'pending'
            };
            userData.bookings.push(newBooking);
            resolve({ data: newBooking });
          }
        }, 500);
      });
    },
    put: (url, data) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { success: true } });
        }, 500);
      });
    },
    delete: (url) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: { success: true } });
        }, 500);
      });
    }
  };

  // 개발 모드에서 실제 API 호출이 실패할 때 모의 API 사용
  const originalRequest = api.request;
  api.request = async (config) => {
    try {
      return await originalRequest(config);
    } catch (error) {
      if (isDevelopment && (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.response?.status === 401)) {
        console.log('백엔드 연결 실패 또는 401 에러, 모의 API 사용:', config.url);
        const method = config.method?.toLowerCase() || 'get';
        return mockApi[method](config.url, config.data);
      }
      throw error;
    }
  };
}

export default api; 