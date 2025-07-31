import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col, Avatar, message, Divider, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const { Title } = Typography;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  // 사용자 프로필 조회
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/api/users/profile').then(res => res.data.user),
    enabled: !!user
  });

  // 프로필 수정 뮤테이션
  const updateProfileMutation = useMutation({
    mutationFn: (data) => api.put('/api/users/profile', data),
    onSuccess: (response) => {
      message.success('프로필이 성공적으로 수정되었습니다.');
      updateUser(response.data.user);
      queryClient.invalidateQueries(['profile']);
      setIsEditing(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '프로필 수정 중 오류가 발생했습니다.');
    }
  });

  // 비밀번호 변경 뮤테이션
  const changePasswordMutation = useMutation({
    mutationFn: (data) => api.put('/api/auth/change-password', data),
    onSuccess: () => {
      message.success('비밀번호가 성공적으로 변경되었습니다.');
      form.resetFields(['current_password', 'new_password', 'confirm_password']);
    },
    onError: (error) => {
      message.error(error.response?.data?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  });

  // 편집 모드 시작
  const startEditing = () => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        timezone: profile.timezone,
        google_calendar_id: profile.google_calendar_id,
        outlook_calendar_id: profile.outlook_calendar_id
      });
    }
    setIsEditing(true);
  };

  // 편집 모드 취소
  const cancelEditing = () => {
    setIsEditing(false);
    form.resetFields();
  };

  // 프로필 수정 제출
  const handleProfileSubmit = (values) => {
    updateProfileMutation.mutate(values);
  };

  // 비밀번호 변경 제출
  const handlePasswordSubmit = (values) => {
    changePasswordMutation.mutate(values);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>프로필을 불러오는 중 오류가 발생했습니다.</div>;
  }

  if (!profile) {
    return <div>프로필 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <Card title="프로필 관리">
        <Row gutter={24}>
          <Col span={8}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={120} 
                icon={<UserOutlined />} 
                style={{ marginBottom: 16 }}
              />
              <h2>{profile.name}</h2>
              <p style={{ color: '#666' }}>{profile.email}</p>
            </div>
          </Col>
          
          <Col span={16}>
            {!isEditing ? (
              <div>
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button 
                    type="primary" 
                    onClick={startEditing}
                  >
                    프로필 수정
                  </Button>
                </div>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <strong>이름:</strong> {profile.name}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <strong>이메일:</strong> {profile.email}
                    </div>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <strong>시간대:</strong> {profile.timezone || 'Asia/Seoul'}
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ marginBottom: 16 }}>
                      <strong>계정 상태:</strong> 
                      <span style={{ color: profile.is_active ? 'green' : 'red' }}>
                        {profile.is_active ? '활성' : '비활성'}
                      </span>
                    </div>
                  </Col>
                </Row>
                
                {profile.google_calendar_id && (
                  <div style={{ marginBottom: 16 }}>
                    <strong>Google Calendar ID:</strong> {profile.google_calendar_id}
                  </div>
                )}
                
                {profile.outlook_calendar_id && (
                  <div style={{ marginBottom: 16 }}>
                    <strong>Outlook Calendar ID:</strong> {profile.outlook_calendar_id}
                  </div>
                )}
              </div>
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleProfileSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="이름"
                      rules={[{ required: true, message: '이름을 입력해주세요.' }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="timezone"
                      label="시간대"
                      rules={[{ required: true, message: '시간대를 선택해주세요.' }]}
                    >
                      <Input defaultValue="Asia/Seoul" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="google_calendar_id"
                      label="Google Calendar ID"
                    >
                      <Input placeholder="Google Calendar ID (선택사항)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="outlook_calendar_id"
                      label="Outlook Calendar ID"
                    >
                      <Input placeholder="Outlook Calendar ID (선택사항)" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={updateProfileMutation.isPending}
                    style={{ marginRight: 8 }}
                  >
                    저장
                  </Button>
                  <Button onClick={cancelEditing}>
                    취소
                  </Button>
                </Form.Item>
              </Form>
            )}
          </Col>
        </Row>
      </Card>

      <Divider />

      <Card title="비밀번호 변경">
        <Form
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="current_password"
                label="현재 비밀번호"
                rules={[{ required: true, message: '현재 비밀번호를 입력해주세요.' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="new_password"
                label="새 비밀번호"
                rules={[
                  { required: true, message: '새 비밀번호를 입력해주세요.' },
                  { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="confirm_password"
                label="새 비밀번호 확인"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: '새 비밀번호를 다시 입력해주세요.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('new_password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={changePasswordMutation.isPending}
            >
              비밀번호 변경
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile; 