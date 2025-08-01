const express = require('express');
const { body, validationResult } = require('express-validator');
const { Booking, Event, User } = require('../models');
const auth = require('../middleware/auth');
const { sendBookingNotification } = require('../services/emailService');

const router = express.Router();

// 예약 목록 조회
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      include: [
        {
          model: Event,
          as: 'event',
          where: { user_id: userId },
          attributes: ['title', 'duration', 'location_type']
        }
      ],
      order: [['scheduled_at', 'DESC']]
    });

    res.json({ bookings });
  } catch (error) {
    console.error('예약 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 예약 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Event,
          as: 'event',
          where: { user_id: userId },
          attributes: ['title', 'description', 'duration', 'location_type', 'location_details']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('예약 상세 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 예약 생성 (공개)
router.post('/', [
  body('event_id').isUUID().withMessage('유효한 이벤트 ID가 필요합니다.'),
  body('guest_name').notEmpty().withMessage('게스트 이름을 입력해주세요.'),
  body('guest_email').isEmail().withMessage('유효한 이메일을 입력해주세요.'),
  body('scheduled_at').isISO8601().withMessage('유효한 날짜를 입력해주세요.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { event_id, guest_name, guest_email, guest_phone, scheduled_at, notes, timezone } = req.body;

    // 이벤트 조회 (호스트 정보 포함)
    const event = await Event.findByPk(event_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    if (!event || !event.is_active) {
      return res.status(404).json({ message: '이벤트를 찾을 수 없습니다.' });
    }

    // 예약 시간 계산
    const startTime = new Date(scheduled_at);
    const endTime = new Date(startTime.getTime() + event.duration * 60000);

    // 중복 예약 확인
    const conflictingBooking = await Booking.findOne({
      where: {
        event_id,
        scheduled_at: {
          [require('sequelize').Op.lt]: endTime
        },
        end_at: {
          [require('sequelize').Op.gt]: startTime
        },
        status: ['pending', 'confirmed']
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({ message: '해당 시간에 이미 예약이 있습니다.' });
    }

    // 예약 생성 (user_id 추가)
    const booking = await Booking.create({
      event_id,
      user_id: event.user.id, // 이벤트 호스트의 user_id 설정
      guest_name,
      guest_email,
      guest_phone,
      scheduled_at: startTime,
      end_at: endTime,
      notes,
      timezone: timezone || 'Asia/Seoul'
    });

    // 이메일 알림 발송
    try {
      await sendBookingNotification(booking, event, 'new');
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
    }

    res.status(201).json({
      message: '예약이 성공적으로 신청되었습니다.',
      booking
    });
  } catch (error) {
    console.error('예약 생성 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 예약 상태 변경 (확정/거절) (인증 필요)
router.put('/:id/status', auth, [
  body('status').isIn(['confirmed', 'declined']).withMessage('유효하지 않은 상태입니다.'),
  body('cancellation_reason').optional().isString().withMessage('취소 사유는 문자열이어야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, cancellation_reason } = req.body;

    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Event,
          as: 'event',
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    // 예약 상태 업데이트
    await booking.update({
      status,
      cancellation_reason: status === 'declined' ? cancellation_reason : null
    });

    // 이메일 알림 발송
    try {
      await sendBookingNotification(booking, booking.event, status);
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
    }

    res.json({
      message: `예약이 ${status === 'confirmed' ? '확정' : '거절'}되었습니다.`,
      booking
    });
  } catch (error) {
    console.error('예약 상태 변경 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 예약 취소 (인증 필요)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Event,
          as: 'event',
          where: { user_id: userId },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: '예약을 찾을 수 없습니다.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: '이미 취소된 예약입니다.' });
    }

    await booking.update({ status: 'cancelled' });

    // 이메일 알림 발송
    try {
      await sendBookingNotification(booking, booking.event, 'cancelled');
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError);
    }

    res.json({ message: '예약이 취소되었습니다.', booking });
  } catch (error) {
    console.error('예약 취소 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 