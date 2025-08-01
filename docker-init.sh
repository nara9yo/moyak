#!/bin/sh

# MOYAK Docker 초기화 스크립트

echo "🚀 MOYAK Docker 초기화 시작..."

# 환경변수 확인
echo "�� 환경변수 확인:"
echo "DB_HOST: $DB_HOST"
echo "DB_PORT: $DB_PORT"
echo "DB_NAME: $DB_NAME"
echo "DB_USER: $DB_USER"
echo "NODE_ENV: $NODE_ENV"

# PostgreSQL 준비 대기
echo "⏳ PostgreSQL 준비 대기 중..."
until pg_isready -h postgres -p 5432 -U moyak_user -d moyak_db > /dev/null 2>&1; do
  echo "PostgreSQL이 준비되지 않았습니다. 5초 후 재시도..."
  sleep 5
done

echo "✅ PostgreSQL 준비 완료!"

# 추가 대기 (PostgreSQL이 완전히 초기화될 때까지)
echo "⏳ PostgreSQL 완전 초기화 대기 중..."
sleep 5

# 데이터베이스 초기화 (init.js에 연결 테스트가 포함되어 있음)
echo "🔄 데이터베이스 초기화 중..."
cd /app/server
node migrations/init.js

if [ $? -eq 0 ]; then
  echo "✅ 데이터베이스 초기화 완료"
else
  echo "❌ 데이터베이스 초기화 실패"
  echo "로그를 확인해주세요:"
  exit 1
fi

echo "🎉 MOYAK 초기화 완료!"
echo "📧 관리자 계정: admin@moyak.com / admin123"
echo "�� 테스트 계정: user@moyak.com / user123"
echo "🌐 접속 URL: http://your-synology-ip:5434"