const express = require('express');
const { Event, Booking } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(auth);

// 대시보드 데이터 조회
router.get('/dashboard', async (req, res) => {
  try {
    // 통계 데이터
    const totalEvents = await Event.count({ where: { user_id: req.user.id } });
    const totalBookings = await Booking.count({
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: req.user.id }
      }]
    });
    const pendingBookings = await Booking.count({
      where: { status: 'pending' },
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: req.user.id }
      }]
    });
    const confirmedBookings = await Booking.count({
      where: { status: 'confirmed' },
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: req.user.id }
      }]
    });

    // 최근 예약 (최근 5개)
    const recentBookings = await Booking.findAll({
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: req.user.id },
        attributes: ['title']
      }],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // 다가오는 이벤트 (최근 5개)
    const upcomingEvents = await Event.findAll({
      where: { 
        user_id: req.user.id,
        is_active: true
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalEvents,
        totalBookings,
        pendingBookings,
        confirmedBookings
      },
      recentBookings,
      upcomingEvents
    });
  } catch (error) {
    console.error('대시보드 데이터 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 