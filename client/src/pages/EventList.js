import React from 'react';
import { Card, Button, Space, Tag, Table, Popconfirm, Typography, Row, Col, App } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

const EventList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

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
      responsive: ['sm'],
      render: (duration) => `${duration}분`
    },
    {
      title: '장소',
      dataIndex: 'location_type',
      key: 'location_type',
      responsive: ['md'],
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
      responsive: ['lg'],
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '작업',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/events/${record.id}`)}
            size="small"
            style={{ padding: '4px 8px' }}
          >
            <span className="hidden-xs">보기</span>
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/events/${record.id}`)}
            size="small"
            style={{ padding: '4px 8px' }}
          >
            <span className="hidden-xs">수정</span>
          </Button>
          <Button
            type="text"
            icon={<CopyOutlined />}
            onClick={() => copyBookingLink(record.booking_link)}
            size="small"
            style={{ padding: '4px 8px' }}
          >
            <span className="hidden-xs">링크</span>
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
              icon={<DeleteOutlined />}
              size="small"
              style={{ padding: '4px 8px', color: '#ff4d4f' }}
            >
              <span className="hidden-xs">삭제</span>
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const renderMobileCard = (event) => (
    <Card
      key={event.id}
      style={{ marginBottom: 16 }}
      className="modern-card"
      actions={[
        <Button
          key="view"
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/events/${event.id}`)}
          size="small"
        >
          보기
        </Button>,
        <Button
          key="edit"
          type="text"
          icon={<EditOutlined />}
          onClick={() => navigate(`/events/${event.id}`)}
          size="small"
        >
          수정
        </Button>,
        <Button
          key="link"
          type="text"
          icon={<CopyOutlined />}
          onClick={() => copyBookingLink(event.booking_link)}
          size="small"
        >
          링크
        </Button>,
        <Popconfirm
          key="delete"
          title="이벤트 삭제"
          description="정말로 이 이벤트를 삭제하시겠습니까?"
          onConfirm={() => deleteEventMutation.mutate(event.id)}
          okText="삭제"
          cancelText="취소"
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            style={{ color: '#ff4d4f' }}
          >
            삭제
          </Button>
        </Popconfirm>
      ]}
    >
      <div style={{ marginBottom: 8 }}>
        <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
          {event.title}
        </Title>
        {event.description && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {event.description.length > 100 
              ? `${event.description.substring(0, 100)}...` 
              : event.description
            }
          </Text>
        )}
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <Tag color="blue">{event.duration}분</Tag>
        {(() => {
          const location = getLocationText(event.location_type);
          return <Tag color={location.color}>{location.text}</Tag>;
        })()}
        <Tag color={event.is_active ? 'green' : 'red'}>
          {event.is_active ? '활성' : '비활성'}
        </Tag>
      </div>
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        생성일: {dayjs(event.created_at).format('YYYY-MM-DD')}
      </div>
    </Card>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          이벤트 관리
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/events/create')}
          className="modern-button"
        >
          이벤트 생성
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>로딩 중...</div>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div style={{ fontSize: '16px', color: '#666', marginBottom: '16px' }}>
            아직 생성된 이벤트가 없습니다.
          </div>
          <div style={{ color: '#999', marginBottom: '24px' }}>
            첫 번째 이벤트를 생성하고 예약 링크를 공유해보세요.
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/events/create')}
            size="large"
          >
            이벤트 생성하기
          </Button>
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden-xs">
            <Table
              columns={columns}
              dataSource={events}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / 총 ${total}개`,
              }}
              className="modern-card"
            />
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="visible-xs">
            {events.map(renderMobileCard)}
          </div>
        </>
      )}
    </div>
  );
};

export default EventList; 