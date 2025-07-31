import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  TimePicker, 
  DatePicker,
  Popconfirm,
  Divider,
  Row,
  Col,
  Statistic,
  App,
  Switch
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();
  const [availabilityForm] = Form.useForm();

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 480); // 모바일 기준을 480px로 변경
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 이벤트 상세 정보 조회
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/api/events/${id}`).then(res => res.data.event),
    enabled: !!id
  });

  // 이벤트 수정 뮤테이션
  const updateEventMutation = useMutation({
    mutationFn: (data) => api.put(`/api/events/${id}`, data),
    onSuccess: () => {
      message.success('이벤트가 성공적으로 수정되었습니다.');
      queryClient.invalidateQueries(['event', id]);
      setEditModalVisible(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '이벤트 수정 중 오류가 발생했습니다.');
    }
  });

  // 이벤트 삭제 뮤테이션
  const deleteEventMutation = useMutation({
    mutationFn: () => api.delete(`/api/events/${id}`),
    onSuccess: () => {
      message.success('이벤트가 성공적으로 삭제되었습니다.');
      navigate('/events');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '이벤트 삭제 중 오류가 발생했습니다.');
    }
  });

  // 가용 시간 추가 뮤테이션
  const addAvailabilityMutation = useMutation({
    mutationFn: (data) => api.post(`/api/events/${id}/availability`, data),
    onSuccess: () => {
      message.success('가용 시간이 추가되었습니다.');
      queryClient.invalidateQueries(['event', id]);
      setAvailabilityModalVisible(false);
      availabilityForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '가용 시간 추가 중 오류가 발생했습니다.');
    }
  });

  // 가용 시간 삭제 뮤테이션
  const deleteAvailabilityMutation = useMutation({
    mutationFn: (availabilityId) => api.delete(`/api/events/${id}/availability/${availabilityId}`),
    onSuccess: () => {
      message.success('가용 시간이 삭제되었습니다.');
      queryClient.invalidateQueries(['event', id]);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '가용 시간 삭제 중 오류가 발생했습니다.');
    }
  });

  // 예약 링크 복사
  const copyBookingLink = () => {
    if (event?.booking_link) {
      navigator.clipboard.writeText(`${window.location.origin}/booking/${event.booking_link}`);
      message.success('예약 링크가 클립보드에 복사되었습니다.');
    }
  };

  const showEditModal = () => {
    if (event) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        duration: event.duration,
        location_type: event.location_type,
        location_details: event.location_details,
        is_active: event.is_active
      });
    }
    setEditModalVisible(true);
  };

  const showAvailabilityModal = () => {
    setAvailabilityModalVisible(true);
  };

  const handleEditSubmit = (values) => {
    updateEventMutation.mutate(values);
  };

  const handleAvailabilitySubmit = (values) => {
    const availabilityData = {
      day_of_week: values.day_of_week,
      start_time: values.time_range[0].format('HH:mm:ss'),
      end_time: values.time_range[1].format('HH:mm:ss')
    };
    addAvailabilityMutation.mutate(availabilityData);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>이벤트를 찾을 수 없습니다.</div>
        <Button onClick={() => navigate('/events')} style={{ marginTop: 16 }}>
          이벤트 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>이벤트를 찾을 수 없습니다.</div>
        <Button onClick={() => navigate('/events')} style={{ marginTop: 16 }}>
          이벤트 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const getLocationText = (locationType) => {
    const locationMap = {
      online: { text: '온라인', color: 'blue' },
      phone: { text: '전화', color: 'green' },
      in_person: { text: '직접 방문', color: 'orange' }
    };
    return locationMap[locationType] || { text: locationType, color: 'default' };
  };

  const availabilityColumns = [
    {
      title: '요일',
      dataIndex: 'day_of_week',
      key: 'day_of_week',
      render: (day) => {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        return days[day];
      }
    },
    {
      title: '시작 시간',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (time) => time?.substring(0, 5) || '00:00'
    },
    {
      title: '종료 시간',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (time) => time?.substring(0, 5) || '00:00'
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="가용 시간 삭제"
          description="정말로 이 가용 시간을 삭제하시겠습니까?"
          onConfirm={() => {
            deleteAvailabilityMutation.mutate(record.id);
          }}
          okText="삭제"
          cancelText="취소"
        >
          <Button type="text" danger size="small">
            삭제
          </Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        marginBottom: 24,
        gap: isMobile ? 16 : 0
      }}>
        <h1 style={{ margin: 0 }}>이벤트 상세</h1>
        <Space 
          direction={isMobile ? 'vertical' : 'horizontal'} 
          style={{ 
            width: isMobile ? '100%' : 'auto',
            flexWrap: isMobile ? 'nowrap' : 'wrap'
          }}
        >
          <Button
            icon={<CopyOutlined />}
            onClick={copyBookingLink}
            className="modern-button"
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            예약 링크 복사
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={showEditModal}
            className="modern-button"
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            수정
          </Button>
          <Popconfirm
            title="이벤트 삭제"
            description="정말로 이 이벤트를 삭제하시겠습니까?"
            onConfirm={() => deleteEventMutation.mutate()}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              className="modern-button"
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="이벤트 정보" className="modern-card">
            <Descriptions 
              bordered 
              column={isMobile ? 1 : 2}
            >
              <Descriptions.Item label="제목" span={isMobile ? 1 : 2}>
                {event.title}
              </Descriptions.Item>
              <Descriptions.Item label="설명" span={isMobile ? 1 : 2}>
                {event.description || '설명 없음'}
              </Descriptions.Item>
              <Descriptions.Item label="소요 시간" span={1}>
                {event.duration}분
              </Descriptions.Item>
              <Descriptions.Item label="장소 유형" span={1}>
                {(() => {
                  const location = getLocationText(event.location_type);
                  return <Tag color={location.color}>{location.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="장소 상세" span={isMobile ? 1 : 2}>
                {event.location_details || '상세 정보 없음'}
              </Descriptions.Item>
              <Descriptions.Item label="상태" span={1}>
                <Tag color={event.is_active ? 'green' : 'red'}>
                  {event.is_active ? '활성' : '비활성'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="생성일" span={1}>
                {dayjs(event.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="통계" className="modern-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="가용 시간"
                  value={event.availabilities?.length || 0}
                  prefix={<ClockCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="예약 수"
                  value={event.bookings?.length || 0}
                  prefix={<UserOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card 
        title="가용 시간" 
        extra={
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={showAvailabilityModal}
            className="modern-button"
          >
            가용 시간 추가
          </Button>
        }
        style={{ marginTop: 24 }}
        className="modern-card"
      >
        {event.availabilities && event.availabilities.length > 0 ? (
          <Table
            columns={availabilityColumns}
            dataSource={event.availabilities}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            설정된 가용 시간이 없습니다.
          </div>
        )}
      </Card>

      {/* 이벤트 수정 모달 */}
      <Modal
        title="이벤트 수정"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="이벤트 제목"
            rules={[{ required: true, message: '이벤트 제목을 입력해주세요.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="duration"
            label="소요 시간 (분)"
            rules={[{ required: true, message: '소요 시간을 입력해주세요.' }]}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="location_type"
            label="장소 유형"
            rules={[{ required: true, message: '장소 유형을 선택해주세요.' }]}
          >
            <Select>
              <Option value="online">온라인</Option>
              <Option value="phone">전화</Option>
              <Option value="in_person">직접 방문</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="location_details"
            label="장소 상세"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="활성 상태"
          >
            <Switch
              checkedChildren="활성"
              unCheckedChildren="비활성"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateEventMutation.isPending}
                className="modern-button"
              >
                수정
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 가용 시간 추가 모달 */}
      <Modal
        title="가용 시간 추가"
        open={availabilityModalVisible}
        onCancel={() => setAvailabilityModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={availabilityForm}
          layout="vertical"
          onFinish={handleAvailabilitySubmit}
        >
          <Form.Item
            name="day_of_week"
            label="요일"
            rules={[{ required: true, message: '요일을 선택해주세요.' }]}
          >
            <Select>
              <Option value={0}>일요일</Option>
              <Option value={1}>월요일</Option>
              <Option value={2}>화요일</Option>
              <Option value={3}>수요일</Option>
              <Option value={4}>목요일</Option>
              <Option value={5}>금요일</Option>
              <Option value={6}>토요일</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="time_range"
            label="시간 범위"
            rules={[{ required: true, message: '시간 범위를 선택해주세요.' }]}
          >
            <TimePicker.RangePicker
              format="HH:mm"
              minuteStep={15}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={addAvailabilityMutation.isPending}
                className="modern-button"
              >
                추가
              </Button>
              <Button onClick={() => setAvailabilityModalVisible(false)}>
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventDetail; 