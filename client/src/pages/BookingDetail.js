import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  message,
  Popconfirm,
  Divider,
  Row,
  Col,
  Statistic,
  Alert
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
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 예약 상세 정보 조회
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => api.get(`/bookings/${id}`).then(res => res.data.booking),
    enabled: !!id
  });

  // 예약 상태 변경 뮤테이션
  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ status, cancellation_reason }) => 
      api.put(`/bookings/${id}/status`, { status, cancellation_reason }),
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
    mutationFn: (cancellation_reason) => 
      api.put(`/bookings/${id}/status`, { status: 'cancelled', cancellation_reason }),
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
    Modal.confirm({
      title: '예약 취소',
      content: '정말로 이 예약을 취소하시겠습니까?',
      onOk: () => {
        cancelBookingMutation.mutate('호스트에 의해 취소됨');
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
      <Card
        title="예약 상세 정보"
        extra={
          <Space>
            {booking.status === 'pending' && (
              <>
                <Button 
                  type="primary" 
                  icon={<CheckOutlined />} 
                  onClick={confirmBooking}
                  loading={updateBookingStatusMutation.isPending}
                >
                  확정
                </Button>
                <Button 
                  danger 
                  icon={<CloseOutlined />} 
                  onClick={declineBooking}
                  loading={updateBookingStatusMutation.isPending}
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
              >
                취소
              </Button>
            )}
            <Button onClick={() => navigate('/bookings')}>
              목록으로
            </Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="예약 상태"
              value={statusText}
              valueStyle={{ color: statusColor }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="소요 시간"
              value={booking.event?.duration || 0}
              suffix="분"
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="예약 시간"
              value={dayjs(booking.scheduled_at).format('MM/DD')}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="생성일"
              value={dayjs(booking.created_at).format('MM/DD')}
              prefix={<CalendarOutlined />}
            />
          </Col>
        </Row>

        <Divider />

        <Descriptions title="예약 정보" bordered>
          <Descriptions.Item label="이벤트" span={3}>
            {booking.event?.title}
          </Descriptions.Item>
          <Descriptions.Item label="게스트 이름">
            {booking.guest_name}
          </Descriptions.Item>
          <Descriptions.Item label="게스트 이메일" span={2}>
            {booking.guest_email}
          </Descriptions.Item>
          <Descriptions.Item label="예약 시간">
            {dayjs(booking.scheduled_at).format('YYYY년 MM월 DD일 HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="종료 시간">
            {dayjs(booking.end_at).format('YYYY년 MM월 DD일 HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="장소">
            {booking.event?.location_type === 'online' ? '온라인' : 
             booking.event?.location_type === 'phone' ? '전화' : 
             booking.event?.location_type === 'in_person' ? '직접 방문' : booking.event?.location_type}
            {booking.event?.location_details && ` - ${booking.event.location_details}`}
          </Descriptions.Item>
          <Descriptions.Item label="상태" span={3}>
            <Tag color={statusColor}>{statusText}</Tag>
          </Descriptions.Item>
          {booking.notes && (
            <Descriptions.Item label="메모" span={3}>
              {booking.notes}
            </Descriptions.Item>
          )}
          {booking.cancellation_reason && (
            <Descriptions.Item label="취소/거절 사유" span={3}>
              {booking.cancellation_reason}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider />

        <Descriptions title="이벤트 정보" bordered>
          <Descriptions.Item label="제목" span={3}>
            {booking.event?.title}
          </Descriptions.Item>
          <Descriptions.Item label="설명" span={3}>
            {booking.event?.description || '설명 없음'}
          </Descriptions.Item>
          <Descriptions.Item label="소요 시간">
            {booking.event?.duration}분
          </Descriptions.Item>
          <Descriptions.Item label="장소 유형">
            {booking.event?.location_type === 'online' ? '온라인' : 
             booking.event?.location_type === 'phone' ? '전화' : 
             booking.event?.location_type === 'in_person' ? '직접 방문' : booking.event?.location_type}
          </Descriptions.Item>
          <Descriptions.Item label="장소 상세">
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
      <Modal
        title="예약 상태 변경"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={null}
        width={500}
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
      </Modal>
    </div>
  );
};

export default BookingDetail; 