import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  TimePicker, 
  message, 
  Steps, 
  Result,
  Descriptions,
  Divider,
  Row,
  Col,
  Alert,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

const PublicBooking = () => {
  const { bookingLink } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [form] = Form.useForm();

  // 이벤트 정보 조회
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['public-event', bookingLink],
    queryFn: () => api.get(`/events/public/${bookingLink}`).then(res => res.data.event),
    enabled: !!bookingLink
  });

  // 예약 생성 뮤테이션
  const createBookingMutation = useMutation({
    mutationFn: (data) => api.post('/bookings', data),
    onSuccess: () => {
      setCurrentStep(2);
      message.success('예약이 성공적으로 완료되었습니다!');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '예약 중 오류가 발생했습니다.');
    }
  });

  // 예약 제출
  const handleBookingSubmit = (values) => {
    if (!selectedAvailability) {
      message.error('가용 시간을 선택해주세요.');
      return;
    }

    const bookingData = {
      event_id: event.id,
      availability_id: selectedAvailability.id,
      guest_name: values.guest_name,
      guest_email: values.guest_email,
      notes: values.notes || ''
    };

    createBookingMutation.mutate(bookingData);
  };

  // 가용 시간 선택
  const handleAvailabilitySelect = (availability) => {
    setSelectedAvailability(availability);
    setCurrentStep(1);
  };

  // 시간대별로 가용 시간 그룹화
  const groupAvailabilitiesByDate = () => {
    if (!event?.availabilities) return {};

    return event.availabilities.reduce((groups, availability) => {
      const date = dayjs(availability.start_time).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(availability);
      return groups;
    }, {});
  };

  // 가용 시간이 있는지 확인
  const hasAvailableSlots = () => {
    return event?.availabilities?.some(av => !av.is_booked) || false;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>이벤트 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="이벤트를 찾을 수 없습니다"
        subTitle="예약 링크가 올바른지 확인해주세요."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </Button>
        }
      />
    );
  }

  if (!event) {
    return (
      <Result
        status="404"
        title="이벤트를 찾을 수 없습니다"
        subTitle="예약 링크가 올바른지 확인해주세요."
      />
    );
  }

  const groupedAvailabilities = groupAvailabilitiesByDate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="이벤트 정보" description="이벤트 상세 정보 확인" />
          <Step title="예약 정보" description="게스트 정보 입력" />
          <Step title="완료" description="예약 완료" />
        </Steps>

        {currentStep === 0 && (
          <div>
            <Descriptions title="이벤트 정보" bordered>
              <Descriptions.Item label="제목" span={3}>
                {event.title}
              </Descriptions.Item>
              <Descriptions.Item label="설명" span={3}>
                {event.description || '설명 없음'}
              </Descriptions.Item>
              <Descriptions.Item label="소요 시간">
                {event.duration}분
              </Descriptions.Item>
              <Descriptions.Item label="장소 유형">
                {event.location_type === 'online' ? '온라인' : 
                 event.location_type === 'phone' ? '전화' : 
                 event.location_type === 'in_person' ? '직접 방문' : event.location_type}
              </Descriptions.Item>
              <Descriptions.Item label="장소 상세">
                {event.location_details || '상세 정보 없음'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3>가용 시간 선택</h3>
            {!hasAvailableSlots() ? (
              <Alert
                message="예약 가능한 시간이 없습니다"
                description="현재 예약 가능한 시간이 없습니다. 나중에 다시 시도해주세요."
                type="warning"
                showIcon
              />
            ) : (
              <div>
                {Object.entries(groupedAvailabilities).map(([date, availabilities]) => {
                  const availableSlots = availabilities.filter(av => !av.is_booked);
                  if (availableSlots.length === 0) return null;

                  return (
                    <Card 
                      key={date} 
                      title={dayjs(date).format('YYYY년 MM월 DD일 (dddd)')}
                      style={{ marginBottom: 16 }}
                    >
                      <Row gutter={[8, 8]}>
                        {availableSlots.map(availability => (
                          <Col key={availability.id} xs={12} sm={8} md={6}>
                            <Button
                              type="outline"
                              style={{ width: '100%', marginBottom: 8 }}
                              onClick={() => handleAvailabilitySelect(availability)}
                            >
                              {dayjs(availability.start_time).format('HH:mm')} - {dayjs(availability.end_time).format('HH:mm')}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && selectedAvailability && (
          <div>
            <Alert
              message="선택된 시간"
              description={`${dayjs(selectedAvailability.start_time).format('YYYY년 MM월 DD일 HH:mm')} - ${dayjs(selectedAvailability.end_time).format('HH:mm')}`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleBookingSubmit}
            >
              <Form.Item
                name="guest_name"
                label="이름"
                rules={[{ required: true, message: '이름을 입력해주세요.' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="게스트 이름" />
              </Form.Item>

              <Form.Item
                name="guest_email"
                label="이메일"
                rules={[
                  { required: true, message: '이메일을 입력해주세요.' },
                  { type: 'email', message: '올바른 이메일 형식을 입력해주세요.' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="게스트 이메일" />
              </Form.Item>

              <Form.Item
                name="notes"
                label="메모 (선택사항)"
              >
                <TextArea 
                  rows={4} 
                  placeholder="예약과 관련된 추가 정보나 요청사항을 입력해주세요."
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={createBookingMutation.isPending}
                  style={{ width: '100%' }}
                >
                  예약 완료
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

        {currentStep === 2 && (
          <Result
            icon={<CheckCircleOutlined />}
            status="success"
            title="예약이 완료되었습니다!"
            subTitle="예약 확인 이메일이 발송되었습니다. 호스트의 승인을 기다려주세요."
            extra={[
              <Button type="primary" key="home" onClick={() => navigate('/')}>
                홈으로 돌아가기
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default PublicBooking; 