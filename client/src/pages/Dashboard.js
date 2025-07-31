import React from 'react';
import { Row, Col, Card, Statistic, Button, List, Tag, Space, Alert, Spin, Typography } from 'antd';
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();

  // 대시보드 데이터 조회
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await api.get('/api/dashboard');
      return response.data;
    },
    refetchInterval: 30000, // 30초마다 새로고침
    retry: 3,
    retryDelay: 1000,
  });

  // API 응답 구조에 맞게 데이터 추출
  const stats = {
    totalEvents: dashboardData?.totalEvents || 0,
    totalBookings: dashboardData?.totalBookings || 0,
    pendingBookings: dashboardData?.pendingBookings || 0,
    confirmedBookings: dashboardData?.confirmedBookings || 0,
  };

  const recentBookings = dashboardData?.recentBookings || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

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

  // 로딩 상태
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>대시보드 데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="데이터 로드 실패"
          description="대시보드 데이터를 불러오는데 실패했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요."
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => window.location.reload()}>
              새로고침
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          대시보드
        </Title>
        <Text type="secondary">
          오늘의 예약 현황과 최근 활동을 확인하세요.
        </Text>
      </div>

      {/* 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span>총 이벤트</span>}
              value={stats.totalEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span>총 예약</span>}
              value={stats.totalBookings}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span>대기중</span>}
              value={stats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span>확정</span>}
              value={stats.confirmedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 최근 예약 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>최근 예약</span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/bookings')}
                  style={{ padding: 0 }}
                >
                  전체보기
                </Button>
              </div>
            }
            size="small"
          >
            <List
              dataSource={recentBookings}
              renderItem={(booking) => (
                <List.Item
                  style={{ padding: '8px 0' }}
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate(`/bookings/${booking.id}`)}
                      style={{ padding: 0 }}
                    >
                      보기
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{booking.guest_name}</span>
                        {getStatusTag(booking.status)}
                      </div>
                    }
                    description={
                      <div>
                        <div>{booking.event_title || '이벤트명 없음'}</div>
                        <div style={{ color: '#666' }}>
                          {dayjs(booking.scheduled_at).format('MM/DD HH:mm')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: '최근 예약이 없습니다.'
              }}
            />
          </Card>
        </Col>

        {/* 다가오는 이벤트 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>다가오는 이벤트</span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/events')}
                  style={{ padding: 0 }}
                >
                  전체보기
                </Button>
              </div>
            }
            size="small"
          >
            <List
              dataSource={upcomingEvents}
              renderItem={(event) => (
                <List.Item
                  style={{ padding: '8px 0' }}
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate(`/events/${event.id}`)}
                      style={{ padding: 0 }}
                    >
                      보기
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: '600' }}>{event.title}</span>
                        <Tag color="blue">{event.duration}분</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ color: '#666', marginBottom: '4px' }}>
                          {event.description || '설명 없음'}
                        </div>
                        <div style={{ color: '#999' }}>
                          {dayjs(event.created_at).format('MM/DD')} 생성
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: '다가오는 이벤트가 없습니다.'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 빠른 액션 */}
      <Card title="빠른 액션" size="small">
        <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/events/create')}
            size="large"
          >
            새 이벤트 생성
          </Button>
          <Button
            icon={<CalendarOutlined />}
            onClick={() => navigate('/events')}
            size="large"
          >
            이벤트 관리
          </Button>
          <Button
            icon={<UserOutlined />}
            onClick={() => navigate('/bookings')}
            size="large"
          >
            예약 관리
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default Dashboard; 