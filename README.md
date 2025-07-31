# MOYAK (모두의 약속) - 예약 스케줄링 플랫폼

MOYAK은 Calendly와 유사한 예약 스케줄링 플랫폼입니다. 사용자가 이벤트를 생성하고 예약 링크를 공유하여 손쉽게 미팅을 예약할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 사용자 관리
- 회원가입 및 로그인 (JWT 인증)
- 프로필 관리 및 비밀번호 변경
- 사용자별 이벤트 및 예약 관리

### 이벤트 관리
- 이벤트 생성 및 수정
- 가용 시간 설정 (요일별, 시간대별)
- 예약 링크 생성 및 공유
- 이벤트 활성화/비활성화

### 예약 시스템
- 공개 예약 페이지를 통한 예약 신청
- 예약 상태 관리 (대기중, 확정, 거절, 취소)
- 이메일 알림 발송
- 중복 예약 방지

### 대시보드
- 실시간 통계 (총 이벤트, 예약 수, 대기중/확정 예약)
- 최근 예약 목록
- 다가오는 이벤트 목록

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **Ant Design** - UI 컴포넌트 라이브러리
- **React Router v6** - 라우팅
- **TanStack Query v5** - 서버 상태 관리
- **React Hook Form** - 폼 관리
- **Day.js** - 날짜/시간 처리
- **Axios** - HTTP 클라이언트

### Backend
- **Node.js** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **Sequelize ORM** - 데이터베이스 ORM
- **PostgreSQL** - 관계형 데이터베이스
- **JWT** - 인증 토큰
- **bcryptjs** - 비밀번호 해싱
- **Nodemailer** - 이메일 발송
- **Multer** - 파일 업로드
- **Express Validator** - 입력 검증
- **Helmet** - 보안 헤더
- **Express Rate Limit** - 요청 제한

### 개발 도구
- **Nodemon** - 서버 자동 재시작
- **React Hot Toast** - 토스트 알림

## 📁 프로젝트 구조

```
moyak/
├── client/                 # React 프론트엔드
│   ├── public/
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── contexts/       # React Context
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── services/       # API 서비스
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js 백엔드
│   ├── config/            # 설정 파일
│   ├── middleware/        # Express 미들웨어
│   ├── models/            # Sequelize 모델
│   ├── routes/            # API 라우트
│   ├── services/          # 비즈니스 로직
│   ├── migrations/        # 데이터베이스 마이그레이션
│   ├── uploads/           # 업로드된 파일
│   └── server.js
├── package.json           # 루트 패키지 설정
└── README.md
```

## 🗄️ 데이터베이스 스키마

### Users (사용자)
- id, email, password, name, profile_image
- timezone, google_calendar_id, outlook_calendar_id
- is_active, email_verified, created_at, updated_at

### Events (이벤트)
- id, user_id, title, description, duration
- location_type, location_details, color
- is_active, booking_link, buffer_time_before/after
- max_bookings_per_day, advance_booking_limit
- cancellation_policy, created_at, updated_at

### Availabilities (가용 시간)
- id, event_id, day_of_week, start_time, end_time
- is_active, created_at, updated_at

### Bookings (예약)
- id, event_id, guest_name, guest_email, guest_phone
- scheduled_at, end_at, status, notes, timezone
- calendar_event_id, cancellation_reason
- reminder_sent, created_at, updated_at

## 🚀 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd moyak
```

### 2. 의존성 설치
```bash
# 루트 디렉토리에서 모든 의존성 설치
npm install

# 또는 개별 설치
cd client && npm install
cd ../server && npm install
```

### 3. 환경 변수 설정
```bash
# server/.env 파일 생성
cp server/.env.example server/.env
```

`.env` 파일 내용:
```env
# 서버 설정
PORT=5000
NODE_ENV=development

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moyak_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# 이메일 설정
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# 프론트엔드 URL
CLIENT_URL=http://localhost:3000
```

### 4. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb moyak_db

# 데이터베이스 초기화 (테이블 생성 + 샘플 데이터)
cd server
npm run init-db
```

### 5. 애플리케이션 실행
```bash
# 루트 디렉토리에서 동시 실행
npm run dev

# 또는 개별 실행
# 터미널 1: 서버 실행
cd server && npm run dev

# 터미널 2: 클라이언트 실행
cd client && npm start
```

## 📱 사용법

### 1. 로그인
- 관리자 계정: `admin@moyak.com` / `admin123`
- 테스트 계정: `user@moyak.com` / `user123`

### 2. 이벤트 생성
1. "새 이벤트 생성" 버튼 클릭
2. 이벤트 정보 입력 (제목, 설명, 시간, 장소 등)
3. 가용 시간 설정 (요일별, 시간대별)
4. 저장

### 3. 예약 링크 공유
1. 생성된 이벤트의 "링크 복사" 버튼 클릭
2. 복사된 링크를 게스트에게 공유

### 4. 예약 관리
1. 대시보드에서 예약 현황 확인
2. 예약 목록에서 상태 변경 (확정/거절)
3. 이메일 알림 자동 발송

## 🔧 개발 모드

### 개발 모드 특징
- **인증 우회**: 데이터 조회 시 인증 없이 첫 번째 사용자 데이터 사용
- **모의 API**: 백엔드 연결 실패 시 프론트엔드에서 모의 데이터 제공
- **자동 새로고침**: 대시보드 30초마다 자동 업데이트
- **에러 처리**: 개발 환경에서 401 에러 무시

### API 엔드포인트
- `GET /api/dashboard` - 대시보드 데이터
- `GET /api/events` - 이벤트 목록
- `POST /api/events` - 이벤트 생성
- `GET /api/bookings` - 예약 목록
- `POST /api/bookings` - 예약 생성
- `GET /api/users/profile` - 사용자 프로필
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 포트 5000 사용 중인 프로세스 확인
   netstat -ano | findstr :5000
   
   # 프로세스 종료
   taskkill /PID <PID> /F
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # PostgreSQL 서비스 상태 확인
   # 데이터베이스 생성 확인
   # .env 파일 설정 확인
   ```

3. **의존성 문제**
   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**MOYAK** - 모두의 약속을 더 쉽게 만들어주는 스케줄링 플랫폼입니다! 🎉 