const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // React 앱 서빙을 위해 추가
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const calendarRoutes = require('./routes/calendar');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy 설정 (X-Forwarded-For 헤더 처리)
app.set('trust proxy', 1);

// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: false, // React 앱을 위해 비활성화
}));

// CORS 설정 (개발 환경에서만)
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  }));
}

// Rate limiting - 더 안전한 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
  },
  // 개발 환경에서는 rate limiting을 완화
  skip: (req) => process.env.NODE_ENV === 'development'
});

app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));



// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/calendar', calendarRoutes);

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MOYAK 서버가 정상적으로 실행 중입니다.' });
});

// React 앱을 위한 정적 파일 서빙 (프로덕션)
if (process.env.NODE_ENV === 'production') {
  // React 빌드 파일 서빙
  app.use(express.static(path.join(__dirname, '../client/build')));

  // React Router를 위한 catch-all 핸들러
  app.get('*', (req, res) => {
    // API 요청이 아닌 경우에만 React 앱으로 라우팅
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    }
  });
}

// 404 핸들러 (API 요청에 대해서만)
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: '요청한 API 리소스를 찾을 수 없습니다.' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '서버 내부 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MOYAK 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🌐 모드: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 이메일 서비스: ${process.env.EMAIL_HOST ? '활성화' : '비활성화'}`);
  console.log(`🗄️  데이터베이스: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`🔒 Rate Limiting: ${process.env.NODE_ENV === 'development' ? '개발 모드 (비활성화)' : '활성화'}`);
}); 