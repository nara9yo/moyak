-- =====================================================
-- MOYAK (모두의 약속) 데이터베이스 스키마
-- PostgreSQL
-- =====================================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE moyak_db;

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 사용자 테이블 (users)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500),
    timezone VARCHAR(100) DEFAULT 'Asia/Seoul',
    google_calendar_id VARCHAR(255),
    outlook_calendar_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- =====================================================
-- 2. 이벤트 테이블 (events)
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL DEFAULT 30, -- 분 단위
    location_type VARCHAR(20) NOT NULL DEFAULT 'online' CHECK (location_type IN ('online', 'phone', 'in_person')),
    location_details TEXT,
    color VARCHAR(7) DEFAULT '#1890ff',
    is_active BOOLEAN DEFAULT true,
    booking_link VARCHAR(255) UNIQUE,
    buffer_time_before INTEGER DEFAULT 0, -- 분 단위
    buffer_time_after INTEGER DEFAULT 0, -- 분 단위
    max_bookings_per_day INTEGER DEFAULT 10,
    advance_booking_limit INTEGER DEFAULT 30, -- 일 단위
    cancellation_policy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 이벤트 테이블 인덱스
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_booking_link ON events(booking_link);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_user_active ON events(user_id, is_active);

-- =====================================================
-- 3. 가용시간 테이블 (availabilities)
-- =====================================================
CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0: 일요일, 1: 월요일, ..., 6: 토요일
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- 제약조건: 시작시간 < 종료시간
    CONSTRAINT check_time_order CHECK (start_time < end_time)
);

-- 가용시간 테이블 인덱스
CREATE INDEX idx_availabilities_event_id ON availabilities(event_id);
CREATE INDEX idx_availabilities_event_day ON availabilities(event_id, day_of_week);
CREATE INDEX idx_availabilities_is_active ON availabilities(is_active);

-- =====================================================
-- 4. 예약 테이블 (bookings)
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL,
    user_id UUID NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'declined')),
    notes TEXT,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Seoul',
    calendar_event_id VARCHAR(255),
    cancellation_reason TEXT,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 외래키 제약조건
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- 제약조건: 예약시간 < 종료시간
    CONSTRAINT check_booking_time_order CHECK (scheduled_at < end_at)
);

-- 예약 테이블 인덱스
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_event_scheduled ON bookings(event_id, scheduled_at);
CREATE INDEX idx_bookings_user_scheduled ON bookings(user_id, scheduled_at);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_status ON bookings(event_id, status);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);

-- =====================================================
-- 5. 뷰 생성 (자주 사용되는 쿼리)
-- =====================================================

-- 활성 이벤트 뷰
CREATE VIEW active_events AS
SELECT 
    e.*,
    u.name as host_name,
    u.email as host_email
FROM events e
JOIN users u ON e.user_id = u.id
WHERE e.is_active = true AND u.is_active = true;

-- 예약 상세 정보 뷰
CREATE VIEW booking_details AS
SELECT 
    b.*,
    e.title as event_title,
    e.duration as event_duration,
    e.location_type,
    e.location_details,
    u.name as host_name,
    u.email as host_email
FROM bookings b
JOIN events e ON b.event_id = e.id
JOIN users u ON e.user_id = u.id;

-- =====================================================
-- 6. 샘플 데이터 삽입
-- =====================================================

-- 샘플 사용자
INSERT INTO users (email, password, name, timezone, is_active, email_verified) VALUES
('admin@moyak.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', '관리자', 'Asia/Seoul', true, true),
('user@moyak.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS.Oi.', '테스트 사용자', 'Asia/Seoul', true, true);

-- 샘플 이벤트 (booking_link는 실제 생성 시 자동으로 생성됨)
INSERT INTO events (user_id, title, description, duration, location_type, location_details, color, is_active, buffer_time_before, buffer_time_after, max_bookings_per_day, advance_booking_limit, cancellation_policy) VALUES
((SELECT id FROM users WHERE email = 'admin@moyak.com'), '미팅 예약', '업무 미팅을 위한 예약입니다.', 30, 'online', 'Zoom 링크', '#1890ff', true, 5, 5, 10, 30, '24시간 전까지 취소 가능');

-- 샘플 가용시간
INSERT INTO availabilities (event_id, day_of_week, start_time, end_time, is_active) VALUES
((SELECT id FROM events WHERE title = '미팅 예약'), 1, '09:00:00', '17:00:00', true), -- 월요일
((SELECT id FROM events WHERE title = '미팅 예약'), 2, '09:00:00', '17:00:00', true), -- 화요일
((SELECT id FROM events WHERE title = '미팅 예약'), 3, '09:00:00', '17:00:00', true), -- 수요일
((SELECT id FROM events WHERE title = '미팅 예약'), 4, '09:00:00', '17:00:00', true), -- 목요일
((SELECT id FROM events WHERE title = '미팅 예약'), 5, '09:00:00', '17:00:00', true); -- 금요일

-- 샘플 예약
INSERT INTO bookings (event_id, user_id, guest_name, guest_email, guest_phone, scheduled_at, end_at, status, notes, timezone) VALUES
((SELECT id FROM events WHERE title = '미팅 예약'), (SELECT id FROM users WHERE email = 'admin@moyak.com'), '김철수', 'kim@example.com', '010-1234-5678', CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '30 minutes', 'confirmed', '첫 번째 미팅입니다.', 'Asia/Seoul'),
((SELECT id FROM events WHERE title = '미팅 예약'), (SELECT id FROM users WHERE email = 'admin@moyak.com'), '이영희', 'lee@example.com', '010-9876-5432', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '2 days' + INTERVAL '30 minutes', 'pending', '상담 예약입니다.', 'Asia/Seoul');

-- =====================================================
-- 7. 권한 설정 (필요시)
-- =====================================================

-- 애플리케이션 사용자에게 권한 부여 (필요시)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moyak_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moyak_user;

-- =====================================================
-- 8. 통계 쿼리 예시
-- =====================================================

-- 사용자별 이벤트 수
-- SELECT u.name, COUNT(e.id) as event_count 
-- FROM users u 
-- LEFT JOIN events e ON u.id = e.user_id 
-- GROUP BY u.id, u.name;

-- 이벤트별 예약 수
-- SELECT e.title, COUNT(b.id) as booking_count 
-- FROM events e 
-- LEFT JOIN bookings b ON e.id = b.event_id 
-- GROUP BY e.id, e.title;

-- 일별 예약 통계
-- SELECT DATE(scheduled_at) as booking_date, COUNT(*) as booking_count 
-- FROM bookings 
-- WHERE scheduled_at >= CURRENT_DATE 
-- GROUP BY DATE(scheduled_at) 
-- ORDER BY booking_date; 