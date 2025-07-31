const express = require('express');
const { Event, Booking, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const dayjs = require('dayjs');

const router = express.Router();

// 대시보드 통계 데이터 조회
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

    const now = dayjs();

    // 기본 통계
    const totalEvents = await Event.count({ where: { user_id: userId } });
    const totalBookings = await Booking.count({
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: userId }
      }]
    });

    const pendingBookings = await Booking.count({
      where: { status: 'pending' },
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: userId }
      }]
    });

    const confirmedBookings = await Booking.count({
      where: { status: 'confirmed' },
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: userId }
      }]
    });

    // 최근 예약 (최근 10개)
    const recentBookings = await Booking.findAll({
      where: {
        scheduled_at: {
          [Op.gte]: now.subtract(30, 'day').toDate()
        }
      },
      include: [{
        model: Event,
        as: 'event',
        where: { user_id: userId },
        attributes: ['title']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    // 다가오는 이벤트 (최근 10개)
    const upcomingEvents = await Event.findAll({
      where: {
        user_id: userId,
        is_active: true
      },
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.json({
      totalEvents,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        status: booking.status,
        scheduled_at: booking.scheduled_at,
        event_title: booking.event?.title,
        created_at: booking.created_at
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        duration: event.duration,
        location_type: event.location_type,
        created_at: event.created_at
      }))
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: '대시보드 데이터를 불러오는데 실패했습니다.' });
  }
});

module.exports = router; 