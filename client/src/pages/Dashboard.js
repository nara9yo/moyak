import React from 'react';
import { Row, Col, Card, Statistic, Button, List, Tag, Space, Alert, Spin } from 'antd';
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
      <div style={{ textAlign: 'center', padding: '50px' }}>
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
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>
          대시보드
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          오늘의 예약 현황과 최근 활동을 확인하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 이벤트"
              value={stats.totalEvents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="총 예약"
              value={stats.totalBookings}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="대기중 예약"
              value={stats.pendingBookings}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="확정된 예약"
              value={stats.confirmedBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 최근 예약 */}
        <Col xs={24} lg={12}>
          <Card
            title="최근 예약"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/bookings')}
                style={{ padding: 0 }}
              >
                모두 보기
              </Button>
            }
          >
            <List
              dataSource={recentBookings}
              loading={isLoading}
              renderItem={(booking) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{booking.guest_name}</span>
                        {getStatusTag(booking.status)}
                      </Space>
                    }
                    description={
                      <div>
                        <div>{booking.event_title || booking.event?.title}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {dayjs(booking.scheduled_at).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: '최근 예약이 없습니다.',
              }}
            />
          </Card>
        </Col>

        {/* 다가오는 이벤트 */}
        <Col xs={24} lg={12}>
          <Card
            title="다가오는 이벤트"
            extra={
              <Button
                type="link"
                onClick={() => navigate('/events')}
                style={{ padding: 0 }}
              >
                모두 보기
              </Button>
            }
          >
            <List
              dataSource={upcomingEvents}
              loading={isLoading}
              renderItem={(event) => (
                <List.Item>
                  <List.Item.Meta
                    title={event.title}
                    description={
                      <div>
                        <div>{event.description}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {event.duration}분 • {event.location_type}
                        </div>
                      </div>
                    }
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    상세보기
                  </Button>
                </List.Item>
              )}
              locale={{
                emptyText: '다가오는 이벤트가 없습니다.',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 빠른 액션 */}
      <Card style={{ marginTop: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px' }}>빠른 액션</h3>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/events/create')}
            >
              새 이벤트 생성
            </Button>
            <Button
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => navigate('/events')}
            >
              이벤트 관리
            </Button>
            <Button
              size="large"
              icon={<UserOutlined />}
              onClick={() => navigate('/bookings')}
            >
              예약 관리
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard; 