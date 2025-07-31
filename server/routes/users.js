const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    // 개발 모드에서는 인증 없이 접근 허용
    let user = null;
    
    if (process.env.NODE_ENV === 'development') {
      // 개발 모드에서는 첫 번째 사용자 사용
      user = await User.findOne();
      if (!user) {
        return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
    } else {
      // 프로덕션 모드에서는 인증 필요
      if (!req.user) {
        return res.status(401).json({ message: '인증이 필요합니다.' });
      }
      user = req.user;
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 프로필 수정 (인증 필요)
router.put('/profile', auth, [
  body('name').optional().isString().withMessage('이름은 문자열이어야 합니다.'),
  body('timezone').optional().isString().withMessage('시간대는 문자열이어야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, timezone, google_calendar_id, outlook_calendar_id } = req.body;

    await req.user.update({
      name: name || req.user.name,
      timezone: timezone || req.user.timezone,
      google_calendar_id: google_calendar_id || req.user.google_calendar_id,
      outlook_calendar_id: outlook_calendar_id || req.user.outlook_calendar_id
    });

    res.json({
      message: '프로필이 성공적으로 수정되었습니다.',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 