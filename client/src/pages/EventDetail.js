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
  message,
  Popconfirm,
  Divider,
  Row,
  Col,
  Statistic
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [availabilityForm] = Form.useForm();

  // 이벤트 상세 정보 조회
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => api.get(`/events/${id}`).then(res => res.data.event),
    enabled: !!id
  });

  // 이벤트 수정 뮤테이션
  const updateEventMutation = useMutation({
    mutationFn: (data) => api.put(`/events/${id}`, data),
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
    mutationFn: () => api.delete(`/events/${id}`),
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
    mutationFn: (data) => api.post(`/events/${id}/availability`, data),
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

  // 예약 링크 복사
  const copyBookingLink = () => {
    if (event?.booking_link) {
      navigator.clipboard.writeText(`${window.location.origin}/booking/${event.booking_link}`);
      message.success('예약 링크가 클립보드에 복사되었습니다.');
    }
  };

  // 편집 모달 열기
  const showEditModal = () => {
    if (event) {
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        duration: event.duration,
        location_type: event.location_type,
        location_details: event.location_details
      });
    }
    setEditModalVisible(true);
  };

  // 가용 시간 추가 모달 열기
  const showAvailabilityModal = () => {
    setAvailabilityModalVisible(true);
  };

  // 이벤트 수정 제출
  const handleEditSubmit = (values) => {
    updateEventMutation.mutate(values);
  };

  // 가용 시간 추가 제출
  const handleAvailabilitySubmit = (values) => {
    const { date, start_time, end_time } = values;
    const startDateTime = dayjs(date).hour(start_time.hour()).minute(start_time.minute());
    const endDateTime = dayjs(date).hour(end_time.hour()).minute(end_time.minute());

    addAvailabilityMutation.mutate({
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString()
    });
  };

  // 가용 시간 테이블 컬럼
  const availabilityColumns = [
    {
      title: '날짜',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (startTime) => dayjs(startTime).format('YYYY년 MM월 DD일')
    },
    {
      title: '시간',
      key: 'time',
      render: (_, record) => (
        <span>
          {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
        </span>
      )
    },
    {
      title: '상태',
      dataIndex: 'is_booked',
      key: 'is_booked',
      render: (isBooked) => (
        <Tag color={isBooked ? 'red' : 'green'}>
          {isBooked ? '예약됨' : '예약 가능'}
        </Tag>
      )
    }
  ];

  // 예약 테이블 컬럼
  const bookingColumns = [
    {
      title: '게스트',
      dataIndex: 'guest_name',
      key: 'guest_name'
    },
    {
      title: '이메일',
      dataIndex: 'guest_email',
      key: 'guest_email'
    },
    {
      title: '예약 시간',
      dataIndex: 'scheduled_at',
      key: 'scheduled_at',
      render: (scheduledAt) => dayjs(scheduledAt).format('YYYY년 MM월 DD일 HH:mm')
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: '대기중' },
          confirmed: { color: 'green', text: '확정' },
          declined: { color: 'red', text: '거절' },
          cancelled: { color: 'gray', text: '취소' }
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>이벤트를 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!event) {
    return <div>이벤트를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <Card
        title="이벤트 상세 정보"
        extra={
          <Space>
            <Button 
              icon={<CopyOutlined />} 
              onClick={copyBookingLink}
            >
              예약 링크 복사
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={showEditModal}
            >
              편집
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
                loading={deleteEventMutation.isPending}
              >
                삭제
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="총 예약"
              value={event.bookings?.length || 0}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="가용 시간"
              value={event.availabilities?.length || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="소요 시간"
              value={event.duration}
              suffix="분"
              prefix={<CalendarOutlined />}
            />
          </Col>
        </Row>

        <Divider />

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
          <Descriptions.Item label="생성일" span={3}>
            {dayjs(event.created_at).format('YYYY년 MM월 DD일 HH:mm')}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Card
          title="가용 시간"
          extra={
            <Button type="primary" onClick={showAvailabilityModal}>
              가용 시간 추가
            </Button>
          }
        >
          <Table
            dataSource={event.availabilities || []}
            columns={availabilityColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>

        <Divider />

        <Card title="예약 현황">
          <Table
            dataSource={event.bookings || []}
            columns={bookingColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Card>

      {/* 이벤트 편집 모달 */}
      <Modal
        title="이벤트 편집"
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
            label="장소 상세 정보"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={updateEventMutation.isPending}>
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
            name="date"
            label="날짜"
            rules={[{ required: true, message: '날짜를 선택해주세요.' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="start_time"
            label="시작 시간"
            rules={[{ required: true, message: '시작 시간을 선택해주세요.' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="종료 시간"
            rules={[{ required: true, message: '종료 시간을 선택해주세요.' }]}
          >
            <TimePicker format="HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={addAvailabilityMutation.isPending}>
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