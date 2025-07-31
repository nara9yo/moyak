require('dotenv').config();
const sequelize = require('../config/database');
const { User, Event, Availability, Booking } = require('../models');

async function initializeDatabase() {
  try {
    console.log('🔄 데이터베이스 초기화 시작...');
    console.log('📊 데이터베이스 설정:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    
    // 데이터베이스 연결 확인
    await sequelize.authenticate();
    console.log('✅ 데이터베이스 연결 성공');
    
    // 테이블 동기화 (force: true는 기존 테이블을 삭제하고 새로 생성)
    await sequelize.sync({ force: true });
    console.log('✅ 데이터베이스 테이블 생성 완료');
    
    // 샘플 데이터 생성
    console.log('🔄 샘플 데이터 생성 중...');
    
    // 샘플 사용자 생성
    const adminUser = await User.create({
      email: 'admin@moyak.com',
      password: 'admin123',
      name: '관리자',
      timezone: 'Asia/Seoul',
      is_active: true,
      email_verified: true
    });
    
    const testUser = await User.create({
      email: 'user@moyak.com',
      password: 'user123',
      name: '테스트 사용자',
      timezone: 'Asia/Seoul',
      is_active: true,
      email_verified: true
    });
    
    console.log('✅ 샘플 사용자 생성 완료');
    
    // 샘플 이벤트 생성
    const sampleEvent = await Event.create({
      user_id: adminUser.id,
      title: '미팅 예약',
      description: '업무 미팅을 위한 예약입니다.',
      duration: 30,
      location_type: 'online',
      location_details: 'Zoom 링크',
      color: '#1890ff',
      is_active: true,
      buffer_time_before: 5,
      buffer_time_after: 5,
      max_bookings_per_day: 10,
      advance_booking_limit: 30,
      cancellation_policy: '24시간 전까지 취소 가능'
    });
    
    console.log('✅ 샘플 이벤트 생성 완료');
    
    // 샘플 가용 시간 생성
    const availabilities = [
      { day_of_week: 1, start_time: '09:00:00', end_time: '17:00:00' }, // 월요일
      { day_of_week: 2, start_time: '09:00:00', end_time: '17:00:00' }, // 화요일
      { day_of_week: 3, start_time: '09:00:00', end_time: '17:00:00' }, // 수요일
      { day_of_week: 4, start_time: '09:00:00', end_time: '17:00:00' }, // 목요일
      { day_of_week: 5, start_time: '09:00:00', end_time: '17:00:00' }, // 금요일
    ];
    
    for (const availability of availabilities) {
      await Availability.create({
        event_id: sampleEvent.id,
        ...availability,
        is_active: true
      });
    }
    
    console.log('✅ 샘플 가용 시간 생성 완료');
    
    // 샘플 예약 생성
    const sampleBookings = [
      {
        event_id: sampleEvent.id,
        guest_name: '김철수',
        guest_email: 'kim@example.com',
        guest_phone: '010-1234-5678',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일
        end_at: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 내일 + 30분
        status: 'confirmed',
        notes: '첫 번째 미팅입니다.',
        timezone: 'Asia/Seoul'
      },
      {
        event_id: sampleEvent.id,
        guest_name: '이영희',
        guest_email: 'lee@example.com',
        guest_phone: '010-9876-5432',
        scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 모레
        end_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 모레 + 30분
        status: 'pending',
        notes: '상담 예약입니다.',
        timezone: 'Asia/Seoul'
      }
    ];
    
    for (const booking of sampleBookings) {
      await Booking.create(booking);
    }
    
    console.log('✅ 샘플 예약 생성 완료');
    
    console.log('🎉 데이터베이스 초기화 완료!');
    console.log('📧 관리자 계정: admin@moyak.com / admin123');
    console.log('📧 테스트 계정: user@moyak.com / user123');
    
  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error);
    throw error;
  }
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ 초기화 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 초기화 실패:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 