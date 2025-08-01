# Node.js 22.17.0 베이스 이미지 사용
FROM node:22.17.0-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 빌드 인자 정의
ARG NODE_ENV=production
ARG REACT_APP_API_URL=http://your-service-ip:5434

# 시스템 패키지 업데이트 및 필요한 패키지 설치
RUN apk update && apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# package.json 파일들을 먼저 복사 (캐싱 최적화)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# 의존성 설치
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# 소스 코드 복사
COPY . .

# 환경별 .env 파일 선택
RUN if [ "$NODE_ENV" = "production" ]; then \
      cp client/.env.production client/.env; \
    else \
      cp client/.env.development client/.env; \
    fi

# React 환경변수 설정 (빌드 시점에 주입)
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV NODE_ENV=$NODE_ENV

# React 앱 빌드
RUN cd client && npm run build

# 초기화 스크립트 복사 및 권한 설정
COPY docker-init.sh /app/
RUN chmod +x /app/docker-init.sh

# 포트 노출
EXPOSE 5000

# 환경변수 설정
ENV PORT=5000

# 헬스 체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 초기화 스크립트 실행 후 서버 시작
CMD ["/bin/sh", "-c", "/app/docker-init.sh && node server/server.js"]