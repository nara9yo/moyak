import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Typography, Space, TimePicker, Switch, message, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EventCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await api.post('/api/events', eventData);
      return response.data;
    },
    onSuccess: (data) => {
      message.success('이벤트가 성공적으로 생성되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '이벤트 생성에 실패했습니다.');
    }
  });

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 가용 시간 데이터 변환
      const availabilities = values.availabilities?.map(avail => ({
        day_of_week: avail.day_of_week,
        start_time: avail.start_time.format('HH:mm:ss'),
        end_time: avail.end_time.format('HH:mm:ss')
      })) || [];

      const eventData = {
        ...values,
        availabilities
      };

      await createEventMutation.mutateAsync(eventData);
    } finally {
      setLoading(false);
    }
  };

  const locationOptions = [
    { value: 'online', label: '온라인' },
    { value: 'phone', label: '전화' },
    { value: 'in_person', label: '직접 방문' }
  ];

  const dayOptions = [
    { value: 0, label: '일요일' },
    { value: 1, label: '월요일' },
    { value: 2, label: '화요일' },
    { value: 3, label: '수요일' },
    { value: 4, label: '목요일' },
    { value: 5, label: '금요일' },
    { value: 6, label: '토요일' }
  ];

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontSize: { xs: '24px', sm: '28px' } }}>
          새 이벤트 생성
        </Title>
        <Text type="secondary" style={{ fontSize: { xs: '14px', sm: '16px' } }}>
          고객이 예약할 수 있는 이벤트를 생성하세요.
        </Text>
      </div>

      <Card size="small">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            duration: 30,
            location_type: 'online',
            color: '#1890ff',
            buffer_time_before: 0,
            buffer_time_after: 0,
            max_bookings_per_day: 10,
            advance_booking_limit: 30,
            is_active: true
          }}
        >
          {/* 기본 정보 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label="이벤트 제목"
                rules={[{ required: true, message: '이벤트 제목을 입력해주세요.' }]}
              >
                <Input placeholder="예: 상담 미팅" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="duration"
                label="소요 시간 (분)"
                rules={[{ required: true, message: '소요 시간을 입력해주세요.' }]}
              >
                <InputNumber
                  min={5}
                  max={480}
                  style={{ width: '100%' }}
                  placeholder="30"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="이벤트 설명"
          >
            <TextArea
              rows={3}
              placeholder="이벤트에 대한 상세한 설명을 입력하세요."
            />
          </Form.Item>

          {/* 장소 및 설정 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="location_type"
                label="장소 유형"
                rules={[{ required: true, message: '장소 유형을 선택해주세요.' }]}
              >
                <Select placeholder="장소 유형 선택">
                  {locationOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="color"
                label="이벤트 색상"
              >
                <Input type="color" style={{ width: '100%', height: '40px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location_details"
            label="장소 상세 정보"
          >
            <TextArea
              rows={2}
              placeholder="Zoom 링크, 주소, 전화번호 등"
            />
          </Form.Item>

          {/* 버퍼 시간 설정 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buffer_time_before"
                label="이전 버퍼 시간 (분)"
              >
                <InputNumber
                  min={0}
                  max={60}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="buffer_time_after"
                label="이후 버퍼 시간 (분)"
              >
                <InputNumber
                  min={0}
                  max={60}
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 예약 제한 설정 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="max_bookings_per_day"
                label="일일 최대 예약 수"
              >
                <InputNumber
                  min={1}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="10"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="advance_booking_limit"
                label="사전 예약 제한 (일)"
              >
                <InputNumber
                  min={1}
                  max={365}
                  style={{ width: '100%' }}
                  placeholder="30"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cancellation_policy"
            label="취소 정책"
          >
            <TextArea
              rows={2}
              placeholder="예: 24시간 전까지 취소 가능"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="이벤트 활성화"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* 가용 시간 설정 */}
          <div style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0, fontSize: { xs: '18px', sm: '20px' } }}>
              가용 시간 설정
            </Title>
            <Text type="secondary" style={{ fontSize: { xs: '12px', sm: '14px' } }}>
              고객이 예약할 수 있는 시간대를 설정하세요.
            </Text>
          </div>

          <Form.List name="availabilities">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: '12px' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        size="small"
                      />
                    }
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'day_of_week']}
                          label="요일"
                          rules={[{ required: true, message: '요일을 선택해주세요.' }]}
                        >
                          <Select placeholder="요일 선택">
                            {dayOptions.map(option => (
                              <Option key={option.value} value={option.value}>
                                {option.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'start_time']}
                          label="시작 시간"
                          rules={[{ required: true, message: '시작 시간을 선택해주세요.' }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: '100%' }}
                            placeholder="09:00"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'end_time']}
                          label="종료 시간"
                          rules={[{ required: true, message: '종료 시간을 선택해주세요.' }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            style={{ width: '100%' }}
                            placeholder="17:00"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    size="large"
                  >
                    가용 시간 추가
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          {/* 제출 버튼 */}
          <Form.Item>
            <Space size="large" style={{ width: '100%', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                이벤트 생성
              </Button>
              <Button
                onClick={() => navigate('/events')}
                size="large"
              >
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EventCreate; 