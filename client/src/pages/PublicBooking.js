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
  Spin,
  Typography
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;

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
    queryFn: () => api.get(`/api/events/public/${bookingLink}`).then(res => res.data.event),
    enabled: !!bookingLink
  });

     // 예약 생성 뮤테이션
   const createBookingMutation = useMutation({
     mutationFn: (data) => api.post('/api/bookings', data),
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

     // 선택된 가용 시간을 기반으로 scheduled_at 계산
     const now = new Date();
     const currentDay = now.getDay(); // 0: 일요일, 1: 월요일, ...
     const targetDay = selectedAvailability.day_of_week;
     
     // 다음 해당 요일까지의 일수 계산
     let daysToAdd = targetDay - currentDay;
     if (daysToAdd <= 0) {
       daysToAdd += 7; // 다음 주로 설정
     }
     
     // 해당 요일의 날짜 계산
     const targetDate = new Date(now);
     targetDate.setDate(now.getDate() + daysToAdd);
     
     // 시간 설정 (HH:mm 형식을 Date 객체로 변환)
     const [hours, minutes] = selectedAvailability.start_time.split(':').map(Number);
     targetDate.setHours(hours, minutes, 0, 0);
     
     const bookingData = {
       event_id: event.id,
       guest_name: values.guest_name,
       guest_email: values.guest_email,
       notes: values.notes || '',
       scheduled_at: targetDate.toISOString(),
       timezone: 'Asia/Seoul'
     };

     createBookingMutation.mutate(bookingData);
   };

  // 가용 시간 선택
  const handleAvailabilitySelect = (availability) => {
    setSelectedAvailability(availability);
    setCurrentStep(1);
  };

  // 이전 단계로 돌아가기
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 시간대별로 가용 시간 그룹화
  const groupAvailabilitiesByDate = () => {
    if (!event?.availabilities) return {};

    return event.availabilities.reduce((groups, availability) => {
      // 요일별로 그룹화
      const dayOfWeek = availability.day_of_week;
      const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dayName = dayNames[dayOfWeek];
      
      if (!groups[dayName]) {
        groups[dayName] = [];
      }
      
      // 시간 데이터를 안전하게 처리
      const startTime = availability.start_time || '00:00:00';
      const endTime = availability.end_time || '00:00:00';
      
      // 시간 형식 정리 (HH:mm:ss에서 HH:mm으로 변환)
      const formattedStartTime = startTime.toString().substring(0, 5);
      const formattedEndTime = endTime.toString().substring(0, 5);
      
      groups[dayName].push({
        ...availability,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      });
      
      return groups;
    }, {});
  };

  // 가용 시간이 있는지 확인
  const hasAvailableSlots = () => {
    return event?.availabilities?.length > 0 || false;
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
     <div style={{ 
       maxWidth: 800, 
       margin: '0 auto', 
       padding: '20px',
       width: '100%',
       minWidth: '100%'
     }}>
      {/* 로고 섹션 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#1890ff', margin: 0 }}>
          모약 (MOYAK)
        </Title>
        <Title level={4} style={{ color: '#666', margin: 0, fontWeight: 'normal' }}>
          모두의 약속
        </Title>
      </div>

             <Card 
         className="public-booking-card"
         style={{ 
           minHeight: 600
         }}
       >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="이벤트 정보" description="이벤트 상세 정보 확인" />
          <Step title="예약 정보" description="게스트 정보 입력" />
          <Step title="완료" description="예약 완료" />
        </Steps>

                 {currentStep === 0 && (
           <div 
             className="public-booking-step-container"
             style={{ 
               minHeight: 400
             }}
           >
                         <Descriptions 
               title="이벤트 정보" 
               bordered 
               column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
               style={{ width: '100%' }}
             >
               <Descriptions.Item label="제목" span={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
                 {event.title}
               </Descriptions.Item>
               <Descriptions.Item label="설명" span={{ xs: 1, sm: 1, md: 2, lg: 3 }}>
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
               <Descriptions.Item label="장소 상세" span={{ xs: 1, sm: 1, md: 2, lg: 1 }}>
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
                style={{ width: '100%' }}
              />
            ) : (
              <div style={{ width: '100%' }}>
                {Object.entries(groupedAvailabilities).map(([dayName, availabilities]) => {
                  if (availabilities.length === 0) return null;

                  return (
                    <Card 
                      key={dayName} 
                      title={dayName}
                      style={{ marginBottom: 16, width: '100%' }}
                    >
                      <Row gutter={[8, 8]} style={{ width: '100%' }}>
                        {availabilities.map(availability => (
                          <Col key={availability.id} xs={12} sm={8} md={6}>
                            <Button
                              type="outline"
                              style={{ width: '100%', marginBottom: 8 }}
                              onClick={() => handleAvailabilitySelect(availability)}
                            >
                              {availability.start_time} - {availability.end_time}
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
           <div 
             className="public-booking-step-container"
             style={{ 
               minHeight: 400
             }}
           >
            {/* 이전 단계 버튼 */}
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handlePreviousStep}
              style={{ marginBottom: 16 }}
            >
              이전 단계
            </Button>

            {(() => {
              const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
              const dayName = dayNames[selectedAvailability.day_of_week];
              
              // 시간 데이터를 안전하게 처리
              const startTime = selectedAvailability.start_time || '00:00:00';
              const endTime = selectedAvailability.end_time || '00:00:00';
              const formattedStartTime = startTime.toString().substring(0, 5);
              const formattedEndTime = endTime.toString().substring(0, 5);
              
              return (
                <Alert
                  message="선택된 시간"
                  description={`${dayName} ${formattedStartTime} - ${formattedEndTime}`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 24, width: '100%' }}
                />
              );
            })()}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleBookingSubmit}
              style={{ width: '100%' }}
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
           <div 
             className="public-booking-step-container"
             style={{ 
               minHeight: 400
             }}
           >
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 400 }}>
               <Result
                 icon={<CheckCircleOutlined />}
                 status="success"
                 title="예약이 완료되었습니다!"
                 subTitle="예약 확인 이메일이 발송되었습니다. 호스트의 승인을 기다려주세요."
               />
               
               <Card 
                 title="예약 정보" 
                 style={{ width: '100%', marginTop: 24 }}
                 bordered
               >
                 <Descriptions 
                   column={{ xs: 1, sm: 1, md: 2, lg: 2 }}
                   bordered
                 >
                   <Descriptions.Item label="이벤트 제목" span={2}>
                     {event.title}
                   </Descriptions.Item>
                   <Descriptions.Item label="예약 시간">
                     {(() => {
                       const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
                       const dayName = dayNames[selectedAvailability.day_of_week];
                       const startTime = selectedAvailability.start_time || '00:00:00';
                       const endTime = selectedAvailability.end_time || '00:00:00';
                       const formattedStartTime = startTime.toString().substring(0, 5);
                       const formattedEndTime = endTime.toString().substring(0, 5);
                       
                       return `${dayName} ${formattedStartTime} - ${formattedEndTime}`;
                     })()}
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
                   <Descriptions.Item label="게스트 이름">
                     {form.getFieldValue('guest_name')}
                   </Descriptions.Item>
                   <Descriptions.Item label="게스트 이메일">
                     {form.getFieldValue('guest_email')}
                   </Descriptions.Item>
                   {form.getFieldValue('notes') && (
                     <Descriptions.Item label="메모" span={2}>
                       {form.getFieldValue('notes')}
                     </Descriptions.Item>
                   )}
                 </Descriptions>
               </Card>
             </div>
           </div>
         )}
      </Card>
    </div>
  );
};

export default PublicBooking; 