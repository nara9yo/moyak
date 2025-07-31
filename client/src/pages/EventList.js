import React from 'react';
import { Card, Button, Space, Tag, Table, Popconfirm, message, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;

const EventList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/api/events');
      return response.data;
    }
  });

  // events 배열 추출 (API 응답이 { events: [...] } 형태)
  const events = eventsData?.events || [];

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await api.delete(`/api/events/${eventId}`);
    },
    onSuccess: () => {
      message.success('이벤트가 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => {
      message.error('이벤트 삭제에 실패했습니다.');
    }
  });

  const copyBookingLink = (bookingLink) => {
    const fullUrl = `${window.location.origin}/booking/${bookingLink}`;
    navigator.clipboard.writeText(fullUrl);
    message.success('예약 링크가 복사되었습니다.');
  };

  const getLocationText = (locationType) => {
    const locationMap = {
      online: { text: '온라인', color: 'blue' },
      phone: { text: '전화', color: 'green' },
      in_person: { text: '직접 방문', color: 'orange' }
    };
    return locationMap[locationType] || { text: locationType, color: 'default' };
  };

  const columns = [
    {
      title: '이벤트명',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: '600' }}>{text}</div>
          {record.description && (
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description
              }
            </div>
          )}
        </div>
      )
    },
    {
      title: '시간',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration}분`
    },
    {
      title: '장소',
      dataIndex: 'location_type',
      key: 'location_type',
      render: (locationType) => {
        const location = getLocationText(locationType);
        return <Tag color={location.color}>{location.text}</Tag>;
      }
    },
    {
      title: '상태',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '활성' : '비활성'}
        </Tag>
      )
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
            onClick={() => navigate(`/events/${record.id}`)}
            size="small"
          >
            보기
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${record.id}`)}
            size="small"
          >
            수정
          </Button>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => copyBookingLink(record.booking_link)}
            size="small"
          >
            링크 복사
          </Button>
          <Popconfirm
            title="이벤트 삭제"
            description="정말로 이 이벤트를 삭제하시겠습니까?"
            onConfirm={() => deleteEventMutation.mutate(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              삭제
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>이벤트 관리</Title>
        <p style={{ color: '#666', margin: 0 }}>
          생성한 이벤트들을 관리하고 예약 링크를 공유하세요.
        </p>
      </div>

      <Card
        title="이벤트 목록"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/events/create')}
          >
            새 이벤트 생성
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={events}
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
    </div>
  );
};

export default EventList; 