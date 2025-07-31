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

// 예약 알림 이메일 발송
const sendBookingNotification = async (booking, event, status = 'new') => {
  if (!process.env.EMAIL_HOST) {
    console.log('이메일 서비스가 설정되지 않았습니다.');
    return;
  }

  const bookingDate = dayjs(booking.scheduled_at).format('YYYY년 MM월 DD일 HH:mm');
  const eventTitle = event.title;
  const guestName = booking.guest_name;
  const hostName = event.user?.name || '호스트';

  let subject, html;

  switch (status) {
    case 'new':
      subject = `[모약] 새로운 예약 신청: ${eventTitle}`;
      html = `
        <h2>새로운 예약 신청이 도착했습니다</h2>
        <p><strong>이벤트:</strong> ${eventTitle}</p>
        <p><strong>게스트:</strong> ${guestName} (${booking.guest_email})</p>
        <p><strong>예약 시간:</strong> ${bookingDate}</p>
        <p><strong>소요 시간:</strong> ${event.duration}분</p>
        <p><strong>장소:</strong> ${getLocationText(event.location_type, event.location_details)}</p>
        ${booking.notes ? `<p><strong>메모:</strong> ${booking.notes}</p>` : ''}
        <br>
        <p>예약을 확인하고 확정 또는 거절해주세요.</p>
      `;
      break;

    case 'confirmed':
      subject = `[모약] 예약 확정: ${eventTitle}`;
      html = `
        <h2>예약이 확정되었습니다</h2>
        <p><strong>이벤트:</strong> ${eventTitle}</p>
        <p><strong>호스트:</strong> ${hostName}</p>
        <p><strong>예약 시간:</strong> ${bookingDate}</p>
        <p><strong>소요 시간:</strong> ${event.duration}분</p>
        <p><strong>장소:</strong> ${getLocationText(event.location_type, event.location_details)}</p>
        <br>
        <p>예약 시간에 맞춰 참석해주세요.</p>
        <p>캘린더에 추가하려면 아래 링크를 클릭하세요:</p>
        <p><a href="${generateCalendarLink(booking, event)}">캘린더에 추가</a></p>
      `;
      break;

    case 'declined':
      subject = `[모약] 예약 거절: ${eventTitle}`;
      html = `
        <h2>예약이 거절되었습니다</h2>
        <p><strong>이벤트:</strong> ${eventTitle}</p>
        <p><strong>호스트:</strong> ${hostName}</p>
        <p><strong>요청 시간:</strong> ${bookingDate}</p>
        ${booking.cancellation_reason ? `<p><strong>거절 사유:</strong> ${booking.cancellation_reason}</p>` : ''}
        <br>
        <p>다른 시간에 다시 예약해주세요.</p>
      `;
      break;

    case 'cancelled':
      subject = `[모약] 예약 취소: ${eventTitle}`;
      html = `
        <h2>예약이 취소되었습니다</h2>
        <p><strong>이벤트:</strong> ${eventTitle}</p>
        <p><strong>게스트:</strong> ${guestName}</p>
        <p><strong>예약 시간:</strong> ${bookingDate}</p>
        <br>
        <p>예약이 취소되었습니다.</p>
      `;
      break;
  }

  // 호스트에게 이메일 발송
  if (event.user?.email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: event.user.email,
      subject: subject,
      html: html,
    });
  }

  // 게스트에게 이메일 발송 (확정/거절/취소 시)
  if (status !== 'new') {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.guest_email,
      subject: subject,
      html: html,
    });
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