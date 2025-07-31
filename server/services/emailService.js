const nodemailer = require('nodemailer');
const dayjs = require('dayjs');

// 이메일 전송기 설정
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 모던한 이메일 템플릿 생성
const createEmailTemplate = (content, status) => {
  const statusColors = {
    new: '#1890ff',
    confirmed: '#52c41a',
    declined: '#ff4d4f',
    cancelled: '#faad14'
  };

  const statusTexts = {
    new: '예약 신청',
    confirmed: '예약 확정',
    declined: '예약 거절',
    cancelled: '예약 취소'
  };

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MOYAK - ${statusTexts[status]}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px;
          text-align: center;
          color: white;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }
        .logo-subtitle {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 20px;
        }
        .status-badge {
          display: inline-block;
          background-color: ${statusColors[status]};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
        }
        .info-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid ${statusColors[status]};
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
          min-width: 100px;
        }
        .info-value {
          color: #212529;
          text-align: right;
          flex: 1;
        }
        .button {
          display: inline-block;
          background-color: ${statusColors[status]};
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          margin: 10px 5px;
          transition: all 0.3s ease;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        .footer-text {
          color: #6c757d;
          font-size: 12px;
          margin-bottom: 10px;
        }
        .footer-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }
        .footer-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 8px;
          }
          .header, .content, .footer {
            padding: 20px;
          }
          .info-row {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }
          .info-value {
            text-align: left;
            margin-top: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">MOYAK</div>
          <div class="logo-subtitle">모두의 약속을 더 쉽게</div>
          <div class="status-badge">${statusTexts[status]}</div>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div class="footer-text">
            이 이메일은 MOYAK 예약 시스템에서 자동으로 발송되었습니다.
          </div>
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="footer-link">
            MOYAK 바로가기
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 예약 알림 이메일 발송
const sendBookingNotification = async (booking, event, status = 'new') => {
  console.log('📧 이메일 발송 시작:', { status, eventTitle: event.title, guestEmail: booking.guest_email });
  console.log('🔍 이벤트 정보:', { 
    eventId: event.id, 
    eventTitle: event.title,
    hasUser: !!event.user,
    userEmail: event.user?.email,
    userName: event.user?.name
  });
  
  if (!process.env.EMAIL_HOST) {
    console.log('❌ 이메일 서비스가 설정되지 않았습니다.');
    return;
  }

  console.log('✅ 이메일 설정 확인됨:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER
  });

  const bookingDate = dayjs(booking.scheduled_at).format('YYYY년 MM월 DD일 HH:mm');
  const eventTitle = event.title;
  const guestName = booking.guest_name;
  const hostName = event.user?.name || '호스트';

  let subject, content;

  switch (status) {
    case 'new':
      subject = `[MOYAK] 예약 신청 완료: ${eventTitle}`;
      content = `
        <h2 style="margin-top: 0; color: #333;">예약 신청이 완료되었습니다!</h2>
        <p style="color: #666; margin-bottom: 30px;">
          ${guestName}님의 예약 신청이 성공적으로 접수되었습니다. 호스트의 확인 후 확정 또는 거절 알림을 받으실 수 있습니다.
        </p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">이벤트</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">호스트</span>
            <span class="info-value">${hostName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">요청 시간</span>
            <span class="info-value">${bookingDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">소요 시간</span>
            <span class="info-value">${event.duration}분</span>
          </div>
          <div class="info-row">
            <span class="info-label">장소</span>
            <span class="info-value">${getLocationText(event.location_type, event.location_details)}</span>
          </div>
          ${booking.notes ? `
          <div class="info-row">
            <span class="info-label">메모</span>
            <span class="info-value">${booking.notes}</span>
          </div>
          ` : ''}
        </div>
        
        <p style="color: #666; text-align: center; margin-top: 30px;">
          호스트의 확인을 기다려주세요. 확정되면 캘린더에 추가할 수 있는 링크를 보내드립니다.
        </p>
      `;
      break;

    case 'confirmed':
      subject = `[MOYAK] 예약 확정: ${eventTitle}`;
      content = `
        <h2 style="margin-top: 0; color: #333;">예약이 확정되었습니다!</h2>
        <p style="color: #666; margin-bottom: 30px;">
          ${guestName}님의 예약이 확정되었습니다. 아래 정보를 확인하고 예약 시간에 맞춰 참석해주세요.
        </p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">이벤트</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">호스트</span>
            <span class="info-value">${hostName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">예약 시간</span>
            <span class="info-value">${bookingDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">소요 시간</span>
            <span class="info-value">${event.duration}분</span>
          </div>
          <div class="info-row">
            <span class="info-label">장소</span>
            <span class="info-value">${getLocationText(event.location_type, event.location_details)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${generateCalendarLink(booking, event)}" class="button">
            📅 캘린더에 추가
          </a>
        </div>
      `;
      break;

    case 'declined':
      subject = `[MOYAK] 예약 거절: ${eventTitle}`;
      content = `
        <h2 style="margin-top: 0; color: #333;">예약이 거절되었습니다</h2>
        <p style="color: #666; margin-bottom: 30px;">
          ${guestName}님의 예약 요청이 거절되었습니다. 다른 시간에 다시 예약해주세요.
        </p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">이벤트</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">호스트</span>
            <span class="info-value">${hostName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">요청 시간</span>
            <span class="info-value">${bookingDate}</span>
          </div>
          ${booking.cancellation_reason ? `
          <div class="info-row">
            <span class="info-label">거절 사유</span>
            <span class="info-value">${booking.cancellation_reason}</span>
          </div>
          ` : ''}
        </div>
        
        <p style="color: #666; text-align: center; margin-top: 30px;">
          다른 시간에 다시 예약해주세요. 감사합니다.
        </p>
      `;
      break;

    case 'cancelled':
      subject = `[MOYAK] 예약 취소: ${eventTitle}`;
      content = `
        <h2 style="margin-top: 0; color: #333;">예약이 취소되었습니다</h2>
        <p style="color: #666; margin-bottom: 30px;">
          ${guestName}님의 예약이 취소되었습니다.
        </p>
        
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">이벤트</span>
            <span class="info-value">${eventTitle}</span>
          </div>
          <div class="info-row">
            <span class="info-label">예약 시간</span>
            <span class="info-value">${bookingDate}</span>
          </div>
        </div>
        
        <p style="color: #666; text-align: center; margin-top: 30px;">
          예약이 취소되었습니다. 감사합니다.
        </p>
      `;
      break;
  }

  const guestHtml = createEmailTemplate(content, status);

  // 호스트용 이메일 내용 생성 (새 예약 신청 시에만)
  let hostSubject, hostContent;
  if (status === 'new') {
    hostSubject = `[MOYAK] 새로운 예약 신청: ${eventTitle}`;
    hostContent = `
      <h2 style="margin-top: 0; color: #333;">새로운 예약 신청이 도착했습니다!</h2>
      <p style="color: #666; margin-bottom: 30px;">
        새로운 예약 신청이 접수되었습니다. 아래 정보를 확인하고 확정 또는 거절해주세요.
      </p>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">이벤트</span>
          <span class="info-value">${eventTitle}</span>
        </div>
        <div class="info-row">
          <span class="info-label">게스트</span>
          <span class="info-value">${guestName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">이메일</span>
          <span class="info-value">${booking.guest_email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">요청 시간</span>
          <span class="info-value">${bookingDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">소요 시간</span>
          <span class="info-value">${event.duration}분</span>
        </div>
        <div class="info-row">
          <span class="info-label">장소</span>
          <span class="info-value">${getLocationText(event.location_type, event.location_details)}</span>
        </div>
        ${booking.notes ? `
        <div class="info-row">
          <span class="info-label">메모</span>
          <span class="info-value">${booking.notes}</span>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666; margin-bottom: 20px;">
          예약을 확인하고 확정 또는 거절해주세요.
        </p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/bookings" class="button">
          📋 예약 관리하기
        </a>
      </div>
    `;
  }

  console.log('📝 이메일 내용 준비 완료:', { 
    guestSubject: subject, 
    hostSubject: hostSubject || 'N/A',
    guestEmail: booking.guest_email,
    hostEmail: event.user?.email 
  });

  // 호스트에게 이메일 발송 (새 예약 신청 시에만)
  if (event.user?.email && status === 'new') {
    try {
      console.log('📤 호스트에게 이메일 발송 중:', event.user.email);
      const hostHtml = createEmailTemplate(hostContent, 'new');
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: event.user.email,
        subject: hostSubject,
        html: hostHtml,
      });
      console.log('✅ 호스트 이메일 발송 성공');
    } catch (error) {
      console.error('❌ 호스트 이메일 발송 실패:', error.message);
    }
  } else if (status !== 'new') {
    console.log('ℹ️ 호스트에게 이메일 발송하지 않음 (새 예약 신청이 아님)');
  } else {
    console.log('⚠️ 호스트 이메일이 없어 발송하지 않음');
  }

  // 게스트에게 이메일 발송 (모든 상태에서 발송)
  try {
    console.log('📤 게스트에게 이메일 발송 중:', booking.guest_email);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.guest_email,
      subject: subject,
      html: guestHtml,
    });
    console.log('✅ 게스트 이메일 발송 성공');
  } catch (error) {
    console.error('❌ 게스트 이메일 발송 실패:', error.message);
  }
};

// 장소 텍스트 생성
const getLocationText = (locationType, locationDetails) => {
  const locationMap = {
    online: '온라인',
    phone: '전화',
    in_person: '직접 방문'
  };
  
  const baseText = locationMap[locationType] || locationType;
  return locationDetails ? `${baseText} - ${locationDetails}` : baseText;
};

// 캘린더 링크 생성
const generateCalendarLink = (booking, event) => {
  const startTime = dayjs(booking.scheduled_at).format('YYYYMMDDTHHmmss');
  const endTime = dayjs(booking.end_at).format('YYYYMMDDTHHmmss');
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(`${event.description || ''}\n\n게스트: ${booking.guest_name}\n이메일: ${booking.guest_email}`);
  const location = encodeURIComponent(getLocationText(event.location_type, event.location_details));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${description}&location=${location}`;
};

module.exports = {
  sendBookingNotification,
  transporter
}; 