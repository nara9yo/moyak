#!/bin/bash

# MOYAK Docker 초기화 스크립트

echo "🚀 MOYAK Docker 초기화 시작..."

# 데이터베이스 연결 대기
echo "⏳ PostgreSQL 데이터베이스 연결 대기 중..."
until node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    process.exit(0);
  })
  .catch((err) => {
    console.log('⏳ 데이터베이스 연결 대기 중...');
    process.exit(1);
  });
" 2>/dev/null; do
  sleep 2
done

echo "✅ 데이터베이스 연결 확인 완료"

# 데이터베이스 초기화
echo "🔄 데이터베이스 초기화 중..."
cd /app/server
node migrations/init.js

if [ $? -eq 0 ]; then
  echo "✅ 데이터베이스 초기화 완료"
else
  echo "❌ 데이터베이스 초기화 실패"
  exit 1
fi

echo "🎉 MOYAK 초기화 완료!"
echo "📧 관리자 계정: admin@moyak.com / admin123"
echo "📧 테스트 계정: user@moyak.com / user123"
echo "🌐 접속 URL: http://your-synology-ip:5434" 