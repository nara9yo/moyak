# 🐳 MOYAK Docker 배포 가이드

## 📋 요구사항

- 시놀로지 NAS (DSM 7.0 이상)
- Docker Package 설치
- 최소 2GB RAM
- 최소 10GB 저장공간

## 🚀 배포 방법

### 1. 프로젝트 파일 업로드

#### File Station 사용
1. **File Station** 열기
2. `docker/moyak` 폴더 생성
3. 프로젝트 파일들을 업로드

#### SSH 사용
```bash
# SSH로 시놀로지 접속
ssh admin@your-service-ip

# 프로젝트 디렉토리 생성
sudo mkdir -p /volume1/docker/moyak
cd /volume1/docker/moyak

# Git에서 프로젝트 클론
git clone https://github.com/your-repo/moyak.git .
```

### 2. 환경변수 설정

#### docker-compose.yml 수정
```yaml
# 이메일 설정을 실제 값으로 변경
EMAIL_USER: your_actual_email@gmail.com
EMAIL_PASS: your_actual_app_password

# 시놀로지 IP 주소로 변경
REACT_APP_API_URL: http://your-service-ip:5434
CLIENT_URL: http://your-service-ip:5434
```

### 3. Docker Compose로 배포

#### SSH에서 실행
```bash
# 프로젝트 디렉토리로 이동
cd /volume1/docker/moyak

# Docker Compose로 서비스 시작
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

#### 컨테이너 매니저에서 실행
1. **컨테이너 매니저** 열기
2. **프로젝트** 탭에서 **추가** 클릭
3. **docker-compose.yml** 파일 선택
4. **적용** 클릭

### 4. 포트 설정

#### 방화벽 설정
1. **제어판** → **보안** → **방화벽**
2. **포트 허용 규칙** 추가:
   - **5434** (MOYAK 앱)
   - **5433** (PostgreSQL, 외부 접속용)

### 5. 접속 확인

#### 브라우저에서 접속
```
http://your-service-ip:5434
```

#### API 테스트
```bash
# 헬스 체크
curl http://your-service-ip:5434/api/health

# 또는 브라우저에서
http://your-service-ip:5434/api/health
```

## 🔧 관리 명령어

### 컨테이너 상태 확인
```bash
# 모든 컨테이너 상태
docker-compose ps

# 로그 확인
docker-compose logs moyak-app
docker-compose logs postgres

# 실시간 로그
docker-compose logs -f moyak-app
```

### 서비스 재시작
```bash
# 전체 서비스 재시작
docker-compose restart

# 특정 서비스만 재시작
docker-compose restart moyak-app
docker-compose restart postgres
```

### 서비스 중지/시작
```bash
# 서비스 중지
docker-compose down

# 서비스 시작
docker-compose up -d

# 서비스 중지 (볼륨 포함)
docker-compose down -v
```

### 데이터베이스 백업
```bash
# 백업 생성
docker exec moyak-postgres pg_dump -U moyak_user moyak_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 백업 복원
docker exec -i moyak-postgres psql -U moyak_user moyak_db < backup_file.sql

# 외부에서 직접 백업 (포트 5433 사용)
pg_dump -h localhost -p 5433 -U moyak_user moyak_db > external_backup.sql

# 외부에서 직접 접속
psql -h localhost -p 5433 -U moyak_user -d moyak_db
```

## 🐛 문제 해결

### 일반적인 문제들

#### 1. 포트 충돌
```bash
# 포트 사용 확인
netstat -tlnp | grep :5434
netstat -tlnp | grep :5433

# 사용 중인 프로세스 종료
sudo kill -9 <PID>
```

#### 2. 데이터베이스 연결 실패
```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose ps postgres

# PostgreSQL 로그 확인
docker-compose logs postgres

# 컨테이너 재시작
docker-compose restart postgres
```

#### 3. 메모리 부족
```bash
# 메모리 사용량 확인
free -h

# 불필요한 컨테이너 정리
docker system prune -a
```

#### 4. 디스크 공간 부족
```bash
# 디스크 사용량 확인
df -h

# Docker 볼륨 정리
docker volume prune
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs moyak-app
docker-compose logs postgres

# 실시간 로그
docker-compose logs -f

# 마지막 100줄
docker-compose logs --tail=100 moyak-app
```

### 컨테이너 내부 접속
```bash
# MOYAK 앱 컨테이너 접속
docker exec -it moyak-app /bin/bash

# PostgreSQL 컨테이너 접속
docker exec -it moyak-postgres psql -U moyak_user -d moyak_db

# 외부에서 PostgreSQL 직접 접속 (포트 5433)
psql -h localhost -p 5433 -U moyak_user -d moyak_db
```

## 🔒 보안 설정

### 1. 비밀번호 변경
```bash
# PostgreSQL 비밀번호 변경
docker exec -it moyak-postgres psql -U moyak_user -d moyak_db
ALTER USER moyak_user PASSWORD 'new_secure_password';
\q

# docker-compose.yml에서도 변경
```

### 2. JWT 시크릿 변경
```yaml
# docker-compose.yml에서 변경
JWT_SECRET: your_new_secure_jwt_secret
```

### 3. 방화벽 설정
- 외부 접속이 필요한 포트만 열기
- 내부 네트워크에서만 접속 허용

## 📊 모니터링

### 리소스 사용량 확인
```bash
# 컨테이너 리소스 사용량
docker stats

# 특정 컨테이너만
docker stats moyak-app postgres
```

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

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 로그 확인: `docker-compose logs`
2. 컨테이너 상태: `docker-compose ps`
3. 리소스 사용량: `docker stats`
4. 네트워크 연결: `ping your-service-ip`

---

**MOYAK** - 모두의 약속을 더 쉽게 만들어주는 스케줄링 플랫폼입니다! 🎉 