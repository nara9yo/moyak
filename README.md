# MOYAK (모두의 약속) - 예약 스케줄링 플랫폼

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22.17.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue.svg)](https://www.docker.com/)

MOYAK은 Calendly와 유사한 예약 스케줄링 플랫폼입니다. 사용자가 이벤트를 생성하고 예약 링크를 공유하여 손쉽게 미팅을 예약할 수 있는 웹 애플리케이션입니다.

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [데이터베이스 스키마](#-데이터베이스-스키마)
- [빠른 시작](#-빠른-시작)
- [설치 및 실행](#-설치-및-실행)
- [사용법](#-사용법)
- [API 문서](#-api-문서)
- [Docker 배포](#-docker-배포-상세-가이드)
- [개발 가이드](#-개발-가이드)
- [문제 해결](#-문제-해결)
- [성능 최적화](#-성능-최적화)
- [보안](#-보안)
- [모니터링](#-모니터링)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🚀 주요 기능

### 👤 사용자 관리
- ✅ 회원가입 및 로그인 (JWT 인증)
- ✅ 프로필 관리 및 비밀번호 변경
- ✅ 시간대 설정 및 사용자별 이벤트 관리
- ✅ 다크모드 지원
- ✅ 반응형 디자인 (데스크톱/모바일/태블릿)

### 📅 이벤트 관리
- ✅ 이벤트 생성 및 수정
- ✅ 가용 시간 설정 (요일별, 시간대별)
- ✅ 예약 링크 생성 및 공유
- ✅ 이벤트 활성화/비활성화
- ✅ 이벤트 템플릿 저장 및 재사용

### 🎯 예약 시스템
- ✅ 공개 예약 페이지를 통한 예약 신청
- ✅ 예약 상태 관리 (대기중, 확정, 거절, 취소)
- ✅ 이메일 알림 발송 (호스트 및 게스트)
- ✅ 중복 예약 방지
- ✅ 예약 상세 정보 표시
- ✅ 예약 취소 및 재예약 기능

### 📊 대시보드
- ✅ 실시간 통계 (총 이벤트, 예약 수, 대기중/확정 예약)
- ✅ 최근 예약 목록
- ✅ 다가오는 이벤트 목록
- ✅ 월별/주별 예약 현황 차트
- ✅ 수익 분석 (유료 플랜 지원 시)

## 🛠️ 기술 스택

### Frontend
- **React 18** - 사용자 인터페이스
- **Ant Design 5** - UI 컴포넌트 라이브러리 (다크모드 지원)
- **React Router v6** - 라우팅
- **TanStack Query v5** - 서버 상태 관리
- **React Hook Form** - 폼 관리
- **Day.js** - 날짜/시간 처리
- **Axios** - HTTP 클라이언트
- **React Hot Toast** - 토스트 알림

### Backend
- **Node.js 22.17.0** - 서버 런타임
- **Express.js** - 웹 프레임워크
- **Sequelize ORM** - 데이터베이스 ORM
- **PostgreSQL 15** - 관계형 데이터베이스
- **JWT** - 인증 토큰
- **bcryptjs** - 비밀번호 해싱
- **Nodemailer** - 이메일 발송
- **Express Validator** - 입력 검증
- **Helmet** - 보안 헤더
- **Express Rate Limit** - 요청 제한
- **CORS** - 크로스 오리진 리소스 공유

### 개발 도구
- **Nodemon** - 서버 자동 재시작
- **Concurrently** - 동시 프로세스 실행
- **Docker** - 컨테이너화
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅

## 📁 프로젝트 구조

```
moyak/
├── client/                 # React 프론트엔드
│   ├── public/
│   │   ├── index.html     # 메인 HTML 파일
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/    # 재사용 가능한 컴포넌트
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   └── PrivateRoute.js
│   │   ├── contexts/      # React Context
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/         # 페이지 컴포넌트
│   │   │   ├── Dashboard.js
│   │   │   ├── EventList.js
│   │   │   ├── EventCreate.js
│   │   │   ├── EventDetail.js
│   │   │   ├── BookingList.js
│   │   │   ├── BookingDetail.js
│   │   │   ├── Profile.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── PublicBooking.js
│   │   ├── services/      # API 서비스
│   │   │   └── api.js
│   │   ├── App.js         # 메인 앱 컴포넌트
│   │   ├── index.js       # 앱 진입점
│   │   └── index.css      # 글로벌 스타일
│   └── package.json
├── server/                 # Node.js 백엔드
│   ├── config/            # 설정 파일
│   │   └── database.js
│   ├── middleware/        # Express 미들웨어
│   │   └── auth.js
│   ├── models/            # Sequelize 모델
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Availability.js
│   │   └── Booking.js
│   ├── routes/            # API 라우트
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── events.js
│   │   ├── bookings.js
│   │   ├── users.js
│   │   └── calendar.js
│   ├── services/          # 비즈니스 로직
│   │   └── emailService.js
│   ├── migrations/        # 데이터베이스 마이그레이션
│   │   ├── database_schema.sql
│   │   └── init.js
│   ├── env.example        # 환경 변수 예시
│   └── server.js          # 서버 진입점
├── Dockerfile             # Docker 이미지 설정
├── docker-compose.yml     # Docker Compose 설정
├── docker-init.sh         # Docker 초기화 스크립트
├── DEPLOYMENT.md          # 배포 가이드
├── package.json           # 루트 패키지 설정
└── README.md
```

## 🗄️ 데이터베이스 스키마

### Users (사용자)
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique)
- `password` (VARCHAR, Hashed)
- `name` (VARCHAR)
- `timezone` (VARCHAR, Default: 'Asia/Seoul')
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Events (이벤트)
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `duration` (INTEGER, minutes)
- `is_active` (BOOLEAN, Default: true)
- `booking_link` (VARCHAR, Unique)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Availabilities (가용 시간)
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key)
- `day_of_week` (INTEGER, 0-6)
- `start_time` (TIME)
- `end_time` (TIME)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Bookings (예약)
- `id` (UUID, Primary Key)
- `event_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `guest_name` (VARCHAR)
- `guest_email` (VARCHAR)
- `scheduled_at` (TIMESTAMP)
- `end_at` (TIMESTAMP)
- `status` (ENUM: 'pending', 'confirmed', 'rejected', 'cancelled')
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## ⚡ 빠른 시작

### Docker로 5분 만에 시작하기

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/moyak.git
cd moyak

# 2. 환경변수 설정
cp server/env.example server/.env
# server/.env 파일을 편집하여 실제 값 입력

# 3. Docker Compose로 실행
docker-compose up -d

# 4. 브라우저에서 접속
open http://localhost:5434
```

### 기본 계정
- **관리자**: `admin@moyak.com` / `admin123`
- **테스트 사용자**: `user@moyak.com` / `user123`

## 🚀 설치 및 실행

### 방법 1: 로컬 개발 환경

#### 1. 저장소 클론
```bash
git clone <repository-url>
cd moyak
```

#### 2. 의존성 설치
```bash
# 루트 디렉토리에서 모든 의존성 설치
npm run install-all

# 또는 개별 설치
npm install
cd server && npm install
cd ../client && npm install
```

#### 3. 환경 변수 설정
```bash
# server/.env 파일 생성
cp server/env.example server/.env
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

# 이메일 설정 (Gmail 예시)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# 프론트엔드 URL
CLIENT_URL=http://localhost:3000
```

#### 4. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb moyak_db

# 데이터베이스 초기화 (테이블 생성 + 샘플 데이터)
cd server
npm run init-db
```

#### 5. 애플리케이션 실행
```bash
# 루트 디렉토리에서 동시 실행 (권장)
npm run dev

# 또는 개별 실행
# 터미널 1: 서버 실행
npm run server

# 터미널 2: 클라이언트 실행
npm run client
```

### 방법 2: Docker 배포 (권장)

#### 1. Docker 설치 확인
```bash
# Docker 버전 확인
docker --version
docker-compose --version
```

#### 2. 환경변수 설정
`docker-compose.yml`에서 다음 값들을 실제 값으로 변경:
```yaml
# 이메일 설정
EMAIL_USER: your_actual_email@gmail.com
EMAIL_PASS: your_actual_app_password

# 시놀로지 IP 주소로 변경
CLIENT_URL: http://your-service-ip:5434
```

#### 3. Docker Compose로 배포
```bash
# 서비스 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

#### 4. 접속 확인
```
http://localhost:5434  # 로컬 배포 시
http://your-service-ip:5434  # 시놀로지 배포 시
```

## 📱 사용법

### 1. 로그인
- 관리자 계정: `admin@moyak.com` / `admin123`
- 테스트 계정: `user@moyak.com` / `user123`

### 2. 이벤트 생성
1. "새 이벤트 생성" 버튼 클릭
2. 이벤트 정보 입력 (제목, 설명, 시간 등)
3. 가용 시간 설정 (요일별, 시간대별)
4. 저장

### 3. 예약 링크 공유
1. 생성된 이벤트의 "링크 복사" 버튼 클릭
2. 복사된 링크를 게스트에게 공유

### 4. 예약 관리
1. 대시보드에서 예약 현황 확인
2. 예약 목록에서 상태 변경 (확정/거절)
3. 이메일 알림 자동 발송

## 📚 API 문서

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입

### 대시보드
- `GET /api/dashboard` - 대시보드 데이터

### 이벤트
- `GET /api/events` - 이벤트 목록
- `GET /api/events/:id` - 이벤트 상세
- `POST /api/events` - 이벤트 생성
- `PUT /api/events/:id` - 이벤트 수정
- `DELETE /api/events/:id` - 이벤트 삭제
- `GET /api/events/public/:bookingLink` - 공개 이벤트 정보
- `POST /api/events/:id/availability` - 가용시간 추가
- `DELETE /api/events/:eventId/availability/:availabilityId` - 가용시간 삭제

### 예약
- `GET /api/bookings` - 예약 목록
- `GET /api/bookings/:id` - 예약 상세
- `POST /api/bookings` - 예약 생성
- `PUT /api/bookings/:id/status` - 예약 상태 변경
- `PUT /api/bookings/:id/cancel` - 예약 취소

### 사용자
- `GET /api/users/profile` - 프로필 조회
- `PUT /api/users/profile` - 프로필 수정
- `PUT /api/users/password` - 비밀번호 변경

### 헬스 체크
- `GET /api/health` - 서비스 상태 확인

## 🐳 Docker 배포 상세 가이드

### 시놀로지 NAS 배포

#### 1. 프로젝트 파일 업로드
```bash
# SSH로 시놀로지 접속
ssh admin@your-service-ip

# 프로젝트 디렉토리 생성
sudo mkdir -p /volume1/docker/moyak
cd /volume1/docker/moyak

# Git에서 프로젝트 클론
git clone https://github.com/your-repo/moyak.git .
```

#### 2. 환경변수 설정
`docker-compose.yml`에서 실제 값으로 변경:
```yaml
EMAIL_USER: your_actual_email@gmail.com
EMAIL_PASS: your_actual_app_password
CLIENT_URL: http://your-service-ip:5434
```

#### 3. Docker Compose로 배포
```bash
# 서비스 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

#### 4. 포트 설정
- **제어판** → **보안** → **방화벽**
- 포트 **5434** 허용 (MOYAK 앱)
- 포트 **5433** 허용 (PostgreSQL, 외부 접속용)

### Docker 관리 명령어

#### 컨테이너 상태 확인
```bash
# 모든 컨테이너 상태
docker-compose ps

# 로그 확인
docker-compose logs moyak-app
docker-compose logs postgres

# 실시간 로그
docker-compose logs -f moyak-app
```

#### 서비스 재시작
```bash
# 전체 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart moyak-app
docker-compose restart postgres
```

#### 데이터베이스 백업
```bash
# 백업 생성
docker exec moyak-postgres pg_dump -U moyak_user moyak_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 복원
docker exec -i moyak-postgres psql -U moyak_user moyak_db < backup_file.sql
```

## 🔧 개발 가이드

### 개발 모드 특징
- **실제 인증**: 개발환경에서도 실제 로그인/인증 필요
- **데이터베이스 로깅**: SQL 쿼리 콘솔 출력
- **자동 새로고침**: 대시보드 30초마다 자동 업데이트
- **에러 처리**: 401 에러 시 자동 로그인 페이지 리다이렉트
- **다크모드**: 테마 전환 기능

### 코드 스타일
```bash
# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format

# 타입 체크 (TypeScript 사용 시)
npm run type-check
```

### 테스트
```bash
# 단위 테스트 실행
npm run test

# 통합 테스트 실행
npm run test:integration

# 테스트 커버리지
npm run test:coverage
```

### 브랜치 전략
- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 포트 사용 확인
   netstat -tlnp | grep :5434
   netstat -tlnp | grep :5433
   
   # 사용 중인 프로세스 종료
   sudo kill -9 <PID>
   ```

2. **데이터베이스 연결 실패**
   ```bash
   # PostgreSQL 컨테이너 상태 확인
   docker-compose ps postgres
   
   # PostgreSQL 로그 확인
   docker-compose logs postgres
   
   # 컨테이너 재시작
   docker-compose restart postgres
   ```

3. **의존성 문제**
   ```bash
   # node_modules 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Ant Design 경고**
   - `message` 사용 시 `App.useApp()` 사용
   - `Modal` 사용 시 `App.useApp().modal` 사용

5. **반응형 레이아웃 문제**
   - CSS 클래스 `hidden-xs`, `visible-xs` 등 사용
   - Ant Design의 `responsive` 속성 대신 커스텀 CSS 사용

6. **Docker 관련 문제**
   ```bash
   # 컨테이너 내부 접속
   docker exec -it moyak-app /bin/bash
   
   # 리소스 사용량 확인
   docker stats
   
   # 불필요한 컨테이너 정리
   docker system prune -a
   ```

### 로그 분석
```bash
# 애플리케이션 로그
docker-compose logs moyak-app --tail=100

# 데이터베이스 로그
docker-compose logs postgres --tail=100

# 실시간 로그 모니터링
docker-compose logs -f --tail=50
```

## 📊 성능 최적화

### 프론트엔드
- React Query를 통한 캐싱
- 컴포넌트 메모이제이션
- 이미지 최적화
- 코드 스플리팅
- 지연 로딩 (Lazy Loading)

### 백엔드
- 데이터베이스 인덱싱
- 쿼리 최적화
- 캐싱 전략
- 압축 미들웨어
- 연결 풀링

### Docker 최적화
- 멀티스테이지 빌드
- 레이어 캐싱
- 볼륨 마운트 최적화
- 리소스 제한 설정

### 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_availabilities_event_id ON availabilities(event_id);

-- 쿼리 최적화
EXPLAIN ANALYZE SELECT * FROM bookings WHERE event_id = ? AND scheduled_at >= ?;

-- 외부 접속 (포트 5433 사용)
-- psql -h localhost -p 5433 -U moyak_user -d moyak_db
```

## 🔒 보안

### 구현된 보안 기능
- JWT 토큰 기반 인증
- 비밀번호 해싱 (bcrypt)
- 입력 검증 (Express Validator)
- 보안 헤더 (Helmet)
- 요청 제한 (Rate Limiting)
- CORS 설정
- Docker 컨테이너 격리

### 보안 체크리스트
- [ ] HTTPS 사용
- [ ] 환경변수 보안
- [ ] SQL 인젝션 방지
- [ ] XSS 방지
- [ ] CSRF 토큰
- [ ] 로그 보안
- [ ] 백업 암호화

### 보안 모니터링
```bash
# 보안 취약점 스캔
npm audit

# Docker 이미지 보안 스캔
docker scan moyak-app

# 의존성 업데이트
npm update
```

## 📊 모니터링

### 헬스 체크
```bash
# 헬스 체크 확인
curl http://your-service-ip:5434/api/health

# 자동 모니터링 스크립트 예시
#!/bin/bash
while true; do
  if curl -f http://your-service-ip:5434/api/health > /dev/null 2>&1; then
    echo "$(date): MOYAK 서비스 정상"
  else
    echo "$(date): MOYAK 서비스 오류 - 재시작 시도"
    docker-compose restart moyak-app
  fi
  sleep 300  # 5분마다 체크
done
```

### 리소스 모니터링
```bash
# 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats moyak-app postgres
```

### 로그 모니터링
```bash
# 실시간 로그
docker-compose logs -f

# 에러 로그만
docker-compose logs -f | grep ERROR

# 특정 시간대 로그
docker-compose logs --since="2024-01-01T00:00:00" --until="2024-01-01T23:59:59"
```

## 🔄 업데이트

### 코드 업데이트
```bash
# 최신 코드 가져오기
git pull origin main

# 컨테이너 재빌드
docker-compose up -d --build

# 로그 확인
docker-compose logs -f moyak-app
```

### 데이터베이스 마이그레이션
```bash
# 마이그레이션 실행
docker exec -it moyak-app node server/migrations/init.js
```

### 백업 및 복원
```bash
# 전체 백업
docker-compose exec postgres pg_dumpall -U moyak_user > backup_$(date +%Y%m%d_%H%M%S).sql

# 특정 데이터베이스만 백업
docker-compose exec postgres pg_dump -U moyak_user moyak_db > moyak_backup.sql

# 백업 복원
docker-compose exec -T postgres psql -U moyak_user moyak_db < backup_file.sql

# 외부에서 직접 백업 (포트 5433 사용)
pg_dump -h localhost -p 5433 -U moyak_user moyak_db > external_backup.sql
```

## 🤝 기여하기

### 기여 방법
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 환경 설정
```bash
# 개발 브랜치 생성
git checkout -b feature/your-feature-name

# 코드 스타일 확인
npm run lint
npm run format

# 테스트 실행
npm run test

# 커밋 전 체크리스트
- [ ] 코드 스타일 준수
- [ ] 테스트 통과
- [ ] 문서 업데이트
- [ ] 커밋 메시지 명확성
```

### 이슈 리포트
버그를 발견하거나 기능 요청이 있으시면 [Issues](../../issues) 페이지에서 등록해주세요.

## 📞 지원

### 문제 해결 순서
1. [문제 해결](#-문제-해결) 섹션 확인
2. [Issues](../../issues) 페이지에서 유사한 문제 검색
3. 새로운 이슈 등록

### 연락처
- **이메일**: nara9yo@gmail.com
- **GitHub**: [Issues](../../issues)
- **문서**: [Wiki](../../wiki)

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

---

**MOYAK** - 모두의 약속을 더 쉽게 만들어주는 스케줄링 플랫폼입니다! 🎉

<div align="center">
  <p>Made with ❤️ by the MOYAK Team</p>
  <p>
    <a href="https://github.com/nara9yo/moyak/stargazers">
      <img src="https://img.shields.io/github/stars/nara9yo/moyak" alt="Stars">
    </a>
    <a href="https://github.com/nara9yo/moyak/network">
      <img src="https://img.shields.io/github/forks/nara9yo/moyak" alt="Forks">
    </a>
    <a href="https://github.com/nara9yo/moyak/issues">
      <img src="https://img.shields.io/github/issues/nara9yo/moyak" alt="Issues">
    </a>
  </p>
</div> 