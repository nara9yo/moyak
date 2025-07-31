import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Button, Card, Typography, Space, TimePicker, Switch, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>새 이벤트 생성</Title>
        <p style={{ color: '#666', margin: 0 }}>
          고객이 예약할 수 있는 이벤트를 생성하세요.
        </p>
      </div>

      <Card>
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
          <Form.Item
            name="title"
            label="이벤트 제목"
            rules={[{ required: true, message: '이벤트 제목을 입력해주세요.' }]}
          >
            <Input placeholder="예: 미팅 예약" />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명"
          >
            <TextArea 
              rows={4} 
              placeholder="이벤트에 대한 설명을 입력하세요."
            />
          </Form.Item>

          <Form.Item
            name="duration"
            label="소요 시간 (분)"
            rules={[{ required: true, message: '소요 시간을 입력해주세요.' }]}
          >
            <InputNumber min={15} max={480} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="location_type"
            label="장소 유형"
            rules={[{ required: true, message: '장소 유형을 선택해주세요.' }]}
          >
            <Select>
              {locationOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="location_details"
            label="장소 상세 정보"
          >
            <Input placeholder="예: Zoom, 회사 회의실, 전화번호 등" />
          </Form.Item>

          <Form.Item
            name="color"
            label="이벤트 색상"
          >
            <Input type="color" style={{ width: '100px' }} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="활성화"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="buffer_time_before"
            label="이전 버퍼 시간 (분)"
          >
            <InputNumber min={0} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="buffer_time_after"
            label="이후 버퍼 시간 (분)"
          >
            <InputNumber min={0} max={60} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="max_bookings_per_day"
            label="일일 최대 예약 수"
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="advance_booking_limit"
            label="사전 예약 제한 (일)"
          >
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="cancellation_policy"
            label="취소 정책"
          >
            <TextArea 
              rows={3} 
              placeholder="취소 정책을 입력하세요."
            />
          </Form.Item>

          <Form.List name="availabilities">
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="가용 시간">
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'day_of_week']}
                        rules={[{ required: true, message: '요일을 선택해주세요.' }]}
                      >
                        <Select style={{ width: 120 }} placeholder="요일">
                          {dayOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'start_time']}
                        rules={[{ required: true, message: '시작 시간을 입력해주세요.' }]}
                      >
                        <TimePicker format="HH:mm" placeholder="시작 시간" />
                      </Form.Item>
                      <span>~</span>
                      <Form.Item
                        {...restField}
                        name={[name, 'end_time']}
                        rules={[{ required: true, message: '종료 시간을 입력해주세요.' }]}
                      >
                        <TimePicker format="HH:mm" placeholder="종료 시간" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      가용 시간 추가
                    </Button>
                  </Form.Item>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Space>
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