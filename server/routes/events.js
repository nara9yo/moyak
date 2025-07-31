const express = require('express');
const { body, validationResult } = require('express-validator');
const { Event, Availability, User } = require('../models');
const auth = require('../middleware/auth');
const dayjs = require('dayjs');

const router = express.Router();

// 이벤트 목록 조회
router.get('/', async (req, res) => {
  try {
    // 개발 모드에서는 인증 없이 접근 허용
    let userId = null;
    
    if (process.env.NODE_ENV === 'development') {
      // 개발 모드에서는 첫 번째 사용자 또는 기본값 사용
      const firstUser = await User.findOne();
      userId = firstUser ? firstUser.id : 1;
    } else {
      // 프로덕션 모드에서는 인증 필요
      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }
      userId = req.user.id;
    }

    const events = await Event.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Availability,
          as: 'availabilities',
          attributes: ['day_of_week', 'start_time', 'end_time']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ events });
  } catch (error) {
    console.error('이벤트 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이벤트 상세 조회
router.get('/:id', async (req, res) => {
  try {
    // 개발 모드에서는 인증 없이 접근 허용
    let userId = null;
    
    if (process.env.NODE_ENV === 'development') {
      // 개발 모드에서는 첫 번째 사용자 또는 기본값 사용
      const firstUser = await User.findOne();
      userId = firstUser ? firstUser.id : 1;
    } else {
      // 프로덕션 모드에서는 인증 필요
      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }
      userId = req.user.id;
    }

    const event = await Event.findOne({
      where: { 
        id: req.params.id,
        user_id: userId 
      },
      include: [
        {
          model: Availability,
          as: 'availabilities',
          attributes: ['id', 'day_of_week', 'start_time', 'end_time', 'is_active']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    res.json({ event });
  } catch (error) {
    console.error('이벤트 상세 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이벤트 생성 (인증 필요)
router.post('/', auth, [
  body('title').notEmpty().withMessage('이벤트 제목을 입력해주세요.'),
  body('duration').isInt({ min: 5, max: 480 }).withMessage('시간은 5분에서 480분 사이여야 합니다.'),
  body('location_type').isIn(['online', 'phone', 'in_person']).withMessage('유효하지 않은 장소 유형입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      duration,
      location_type,
      location_details,
      color,
      buffer_time_before,
      buffer_time_after,
      max_bookings_per_day,
      advance_booking_limit,
      cancellation_policy,
      availabilities
    } = req.body;

    // 이벤트 생성
    const event = await Event.create({
      user_id: req.user.id,
      title,
      description,
      duration,
      location_type,
      location_details,
      color,
      buffer_time_before,
      buffer_time_after,
      max_bookings_per_day,
      advance_booking_limit,
      cancellation_policy
    });

    // 가용 시간 생성
    if (availabilities && Array.isArray(availabilities)) {
      const availabilityData = availabilities.map(avail => ({
        event_id: event.id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time,
        is_active: true
      }));

      await Availability.bulkCreate(availabilityData);
    }

    res.status(201).json({
      message: '이벤트가 성공적으로 생성되었습니다.',
      event
    });
  } catch (error) {
    console.error('이벤트 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이벤트 수정 (인증 필요)
router.put('/:id', auth, [
  body('title').notEmpty().withMessage('이벤트 제목을 입력해주세요.'),
  body('duration').isInt({ min: 5, max: 480 }).withMessage('시간은 5분에서 480분 사이여야 합니다.'),
  body('location_type').isIn(['online', 'phone', 'in_person']).withMessage('유효하지 않은 장소 유형입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    const {
      title,
      description,
      duration,
      location_type,
      location_details,
      color,
      buffer_time_before,
      buffer_time_after,
      max_bookings_per_day,
      advance_booking_limit,
      cancellation_policy,
      availabilities
    } = req.body;

    // 이벤트 업데이트
    await event.update({
      title,
      description,
      duration,
      location_type,
      location_details,
      color,
      buffer_time_before,
      buffer_time_after,
      max_bookings_per_day,
      advance_booking_limit,
      cancellation_policy
    });

    // 기존 가용 시간 삭제 후 새로 생성
    if (availabilities && Array.isArray(availabilities)) {
      await Availability.destroy({ where: { event_id: event.id } });
      
      const availabilityData = availabilities.map(avail => ({
        event_id: event.id,
        day_of_week: avail.day_of_week,
        start_time: avail.start_time,
        end_time: avail.end_time,
        is_active: true
      }));

      await Availability.bulkCreate(availabilityData);
    }

    res.json({
      message: '이벤트가 성공적으로 수정되었습니다.',
      event
    });
  } catch (error) {
    console.error('이벤트 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이벤트 삭제 (인증 필요)
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      where: { 
        id: req.params.id,
        user_id: req.user.id 
      }
    });

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    await event.destroy();

    res.json({ message: '이벤트가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('이벤트 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 공개 이벤트 조회 (인증 불필요)
router.get('/public/:bookingLink', async (req, res) => {
  try {
    const event = await Event.findOne({
      where: { 
        booking_link: req.params.bookingLink,
        is_active: true 
      },
      include: [
        {
          model: Availability,
          as: 'availabilities',
          where: { is_active: true },
          attributes: ['id', 'day_of_week', 'start_time', 'end_time']
        }
      ]
    });

    if (!event) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    // 가용 시간 데이터를 클라이언트에서 사용할 수 있는 형식으로 변환
    const eventData = event.toJSON();
    if (eventData.availabilities) {
      eventData.availabilities = eventData.availabilities.map(availability => {
        // TIME 타입 데이터를 문자열로 변환
        const startTimeStr = availability.start_time.toString();
        const endTimeStr = availability.end_time.toString();
        
        return {
          ...availability,
          start_time: startTimeStr,
          end_time: endTimeStr
        };
      });
    }

    res.json({ event: eventData });
  } catch (error) {
    console.error('공개 이벤트 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 