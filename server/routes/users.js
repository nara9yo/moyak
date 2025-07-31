const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;

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

    const user = req.user;

    const { name, timezone, google_calendar_id, outlook_calendar_id } = req.body;

    await user.update({
      name: name || user.name,
      timezone: timezone || user.timezone,
      google_calendar_id: google_calendar_id || user.google_calendar_id,
      outlook_calendar_id: outlook_calendar_id || user.outlook_calendar_id
    });

    res.json({
      message: '프로필이 성공적으로 수정되었습니다.',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('프로필 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 