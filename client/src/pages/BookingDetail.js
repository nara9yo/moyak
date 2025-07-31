import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Form, 
  Input, 
  Popconfirm,
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
  App
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { TextArea } = Input;

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 예약 상세 정보 조회
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/api/bookings/${id}`).then(res => res.data.booking),
    enabled: !!id
  });

  // 예약 상태 변경 뮤테이션
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ status, cancellation_reason }) => 
      api.put(`/api/bookings/${id}/status`, { status, cancellation_reason }),
    onSuccess: () => {
      message.success('예약 상태가 성공적으로 변경되었습니다.');
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
      setStatusModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '예약 상태 변경 중 오류가 발생했습니다.');
    }
  });

  // 예약 취소 뮤테이션
  const cancelBookingMutation = useMutation({
    mutationFn: () => 
      api.put(`/api/bookings/${id}/cancel`),
    onSuccess: () => {
      message.success('예약이 성공적으로 취소되었습니다.');
      queryClient.invalidateQueries(['booking', id]);
      queryClient.invalidateQueries(['bookings']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '예약 취소 중 오류가 발생했습니다.');
    }
  });

  // 상태 변경 모달 열기
  const showStatusModal = (status) => {
    form.setFieldsValue({ status });
    setStatusModalVisible(true);
  };

  // 상태 변경 제출
  const handleStatusSubmit = (values) => {
    updateBookingStatusMutation.mutate(values);
  };

  // 예약 확정
  const confirmBooking = () => {
    updateBookingStatusMutation.mutate({ status: 'confirmed' });
  };

  // 예약 거절
  const declineBooking = () => {
    showStatusModal('declined');
  };

  // 예약 취소
  const cancelBooking = () => {
    modal.confirm({
      title: '예약 취소',
      content: '정말로 이 예약을 취소하시겠습니까?',
      onOk: () => {
        cancelBookingMutation.mutate();
      }
    });
  };

  // 상태별 색상과 텍스트
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'orange', text: '대기중' },
      confirmed: { color: 'green', text: '확정' },
      declined: { color: 'red', text: '거절' },
      cancelled: { color: 'gray', text: '취소' }
    };
    return statusMap[status] || { color: 'default', text: status };
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>예약을 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!booking) {
    return <div>예약을 찾을 수 없습니다.</div>;
  }

  const { color: statusColor, text: statusText } = getStatusInfo(booking.status);

  return (
    <div>
             <Card title="예약 상세 정보">
         {/* 모바일에서만 버튼을 타이틀 아래에 표시 */}
         {isMobile && (
           <div style={{ marginBottom: '16px' }}>
             <div className="booking-actions">
               <Space wrap>
                 {booking.status === 'pending' && (
                   <>
                     <Button 
                       type="primary" 
                       icon={<CheckOutlined />} 
                       onClick={confirmBooking}
                       loading={updateBookingStatusMutation.isPending}
                       size="small"
                     >
                       확정
                     </Button>
                     <Button 
                       danger 
                       icon={<CloseOutlined />} 
                       onClick={declineBooking}
                       loading={updateBookingStatusMutation.isPending}
                       size="small"
                     >
                       거절
                     </Button>
                   </>
                 )}
                 {booking.status === 'confirmed' && (
                   <Button 
                     danger 
                     icon={<CloseOutlined />} 
                     onClick={cancelBooking}
                     loading={cancelBookingMutation.isPending}
                     size="small"
                   >
                     취소
                   </Button>
                 )}
                 <Button 
                   onClick={() => navigate('/bookings')}
                   size="small"
                 >
                   목록으로
                 </Button>
               </Space>
             </div>
           </div>
         )}
         
         {/* 데스크톱에서만 버튼을 타이틀 옆에 표시 */}
         {!isMobile && (
           <div style={{ 
             position: 'absolute', 
             top: '16px', 
             right: '24px' 
           }}>
             <div className="booking-actions">
               <Space wrap>
                 {booking.status === 'pending' && (
                   <>
                     <Button 
                       type="primary" 
                       icon={<CheckOutlined />} 
                       onClick={confirmBooking}
                       loading={updateBookingStatusMutation.isPending}
                       size="small"
                     >
                       확정
                     </Button>
                     <Button 
                       danger 
                       icon={<CloseOutlined />} 
                       onClick={declineBooking}
                       loading={updateBookingStatusMutation.isPending}
                       size="small"
                     >
                       거절
                     </Button>
                   </>
                 )}
                 {booking.status === 'confirmed' && (
                   <Button 
                     danger 
                     icon={<CloseOutlined />} 
                     onClick={cancelBooking}
                     loading={cancelBookingMutation.isPending}
                     size="small"
                   >
                     취소
                   </Button>
                 )}
                 <Button 
                   onClick={() => navigate('/bookings')}
                   size="small"
                 >
                   목록으로
                 </Button>
               </Space>
             </div>
           </div>
                   )}
          
          {/* 모바일에서만 버튼 아래 구분선 표시 */}
          {isMobile && (
            <Divider style={{ margin: '16px 0' }} />
          )}
          
                 <Row gutter={16}>
           <Col xs={12} sm={12} md={6} lg={6}>
             <Statistic
               title="예약 상태"
               value={statusText}
               valueStyle={{ color: statusColor }}
               className="mobile-statistic"
             />
           </Col>
           <Col xs={12} sm={12} md={6} lg={6}>
             <Statistic
               title="소요 시간"
               value={booking.event?.duration || 0}
               suffix="분"
               prefix={<ClockCircleOutlined />}
               className="mobile-statistic"
             />
           </Col>
           <Col xs={12} sm={12} md={6} lg={6}>
             <Statistic
               title="예약 시간"
               value={dayjs(booking.scheduled_at).format('MM/DD')}
               prefix={<CalendarOutlined />}
               className="mobile-statistic"
             />
           </Col>
           <Col xs={12} sm={12} md={6} lg={6}>
             <Statistic
               title="생성일"
               value={dayjs(booking.created_at).format('MM/DD')}
               prefix={<CalendarOutlined />}
               className="mobile-statistic"
             />
           </Col>
                   </Row>

                   <Divider />

                                   <Descriptions 
            title="예약 정보" 
            bordered
            column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
          >
            <Descriptions.Item label="이벤트" span={1}>
              {booking.event?.title}
            </Descriptions.Item>
            <Descriptions.Item label="게스트 이름" span={1}>
              {booking.guest_name}
            </Descriptions.Item>
            <Descriptions.Item label="게스트 이메일" span={1}>
              {booking.guest_email}
            </Descriptions.Item>
            <Descriptions.Item label="예약 시간" span={1}>
              {dayjs(booking.scheduled_at).format('YYYY년 MM월 DD일 HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="종료 시간" span={1}>
              {dayjs(booking.end_at).format('YYYY년 MM월 DD일 HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="장소" span={1}>
              {booking.event?.location_type === 'online' ? '온라인' : 
               booking.event?.location_type === 'phone' ? '전화' : 
               booking.event?.location_type === 'in_person' ? '직접 방문' : booking.event?.location_type}
              {booking.event?.location_details && ` - ${booking.event.location_details}`}
            </Descriptions.Item>
            <Descriptions.Item label="상태" span={1}>
              <Tag color={statusColor}>{statusText}</Tag>
            </Descriptions.Item>
            {booking.notes && (
              <Descriptions.Item label="메모" span={1}>
                {booking.notes}
              </Descriptions.Item>
            )}
            {booking.cancellation_reason && (
              <Descriptions.Item label="취소/거절 사유" span={1}>
                {booking.cancellation_reason}
              </Descriptions.Item>
            )}
          </Descriptions>

        <Divider />

                                   <Descriptions 
            title="이벤트 정보" 
            bordered
            column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
          >
            <Descriptions.Item label="제목" span={1}>
              {booking.event?.title}
            </Descriptions.Item>
            <Descriptions.Item label="설명" span={1}>
              {booking.event?.description || '설명 없음'}
            </Descriptions.Item>
            <Descriptions.Item label="소요 시간" span={1}>
              {booking.event?.duration}분
            </Descriptions.Item>
            <Descriptions.Item label="장소 유형" span={1}>
              {booking.event?.location_type === 'online' ? '온라인' : 
               booking.event?.location_type === 'phone' ? '전화' : 
               booking.event?.location_type === 'in_person' ? '직접 방문' : booking.event?.location_type}
            </Descriptions.Item>
            <Descriptions.Item label="장소 상세" span={1}>
              {booking.event?.location_details || '상세 정보 없음'}
            </Descriptions.Item>
          </Descriptions>

        {booking.status === 'confirmed' && (
          <>
            <Divider />
            <Alert
              message="예약 확정됨"
              description="이 예약은 확정되었습니다. 게스트에게 이메일이 발송되었습니다."
              type="success"
              showIcon
            />
          </>
        )}

        {booking.status === 'declined' && (
          <>
            <Divider />
            <Alert
              message="예약 거절됨"
              description="이 예약은 거절되었습니다. 게스트에게 이메일이 발송되었습니다."
              type="error"
              showIcon
            />
          </>
        )}

        {booking.status === 'cancelled' && (
          <>
            <Divider />
            <Alert
              message="예약 취소됨"
              description="이 예약은 취소되었습니다. 게스트에게 이메일이 발송되었습니다."
              type="warning"
              showIcon
            />
          </>
        )}
      </Card>

      {/* 상태 변경 모달 */}
      {statusModalVisible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setStatusModalVisible(false)}
        >
          <Card
            title="예약 상태 변경"
            style={{ width: 500, maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleStatusSubmit}
            >
              <Form.Item
                name="status"
                label="상태"
                rules={[{ required: true, message: '상태를 선택해주세요.' }]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                name="cancellation_reason"
                label="거절/취소 사유"
                rules={[{ required: true, message: '사유를 입력해주세요.' }]}
              >
                <TextArea rows={4} placeholder="거절 또는 취소 사유를 입력해주세요." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={updateBookingStatusMutation.isPending}
                  >
                    변경
                  </Button>
                  <Button onClick={() => setStatusModalVisible(false)}>
                    취소
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookingDetail; 