import React, { useState } from 'react';
import { Card, Button, Space, Tag, Table, Modal, Form, Input, Select, message, Typography } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const BookingList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form] = Form.useForm();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await api.get('/api/bookings');
      return response.data;
    }
  });

  // bookings 배열 추출 (API 응답이 { bookings: [...] } 형태)
  const bookings = bookingsData?.bookings || [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status, reason }) => {
      await api.put(`/api/bookings/${bookingId}/status`, { status, cancellation_reason: reason });
    },
    onSuccess: () => {
      message.success('예약 상태가 업데이트되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setStatusModalVisible(false);
      setSelectedBooking(null);
      form.resetFields();
    },
    onError: () => {
      message.error('예약 상태 업데이트에 실패했습니다.');
    }
  });

  const getStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'orange', text: '대기중' },
      confirmed: { color: 'green', text: '확정' },
      cancelled: { color: 'red', text: '취소' },
      declined: { color: 'red', text: '거절' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleStatusUpdate = (booking, status) => {
    setSelectedBooking(booking);
    setStatusModalVisible(true);
    form.setFieldsValue({ status });
  };

  const onStatusSubmit = async (values) => {
    await updateStatusMutation.mutateAsync({
      bookingId: selectedBooking.id,
      status: values.status,
      reason: values.reason
    });
  };

  const columns = [
    {
      title: '게스트',
      dataIndex: 'guest_name',
      key: 'guest_name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: '600' }}>{text}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.guest_email}</div>
        </div>
      )
    },
    {
      title: '이벤트',
      dataIndex: ['event', 'title'],
      key: 'event_title'
    },
    {
      title: '예약 시간',
      dataIndex: 'scheduled_at',
      key: 'scheduled_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '생성일',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/bookings/${record.id}`)}
            size="small"
          >
            보기
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<CheckOutlined />}
                onClick={() => handleStatusUpdate(record, 'confirmed')}
                size="small"
                style={{ color: '#52c41a' }}
              >
                확정
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => handleStatusUpdate(record, 'declined')}
                size="small"
                danger
              >
                거절
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>예약 관리</Title>
        <p style={{ color: '#666', margin: 0 }}>
          모든 예약을 확인하고 상태를 관리하세요.
        </p>
      </div>

      <Card title="예약 목록">
        <Table
          columns={columns}
          dataSource={bookings}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
          }}
        />
      </Card>

      {/* 상태 변경 모달 */}
      <Modal
        title="예약 상태 변경"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedBooking(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onStatusSubmit}
        >
          <Form.Item
            name="status"
            label="상태"
            rules={[{ required: true, message: '상태를 선택해주세요.' }]}
          >
            <Select>
              <Option value="confirmed">확정</Option>
              <Option value="declined">거절</Option>
              <Option value="cancelled">취소</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="사유 (선택사항)"
          >
            <TextArea
              rows={3}
              placeholder="상태 변경 사유를 입력하세요."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isPending}
              >
                상태 변경
              </Button>
              <Button
                onClick={() => {
                  setStatusModalVisible(false);
                  setSelectedBooking(null);
                  form.resetFields();
                }}
              >
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingList; 