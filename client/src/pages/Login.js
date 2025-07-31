import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Space, Alert, Collapse, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        message.error(result.error || '로그인에 실패했습니다.');
      }
    } catch (error) {
      message.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Collapse items 설정
  const collapseItems = [
    {
      key: '1',
      label: (
        <Space>
          <InfoCircleOutlined style={{ color: '#1890ff' }} />
          <Text strong>테스트 계정 정보</Text>
        </Space>
      ),
      children: (
        <div>
          <Alert
            message="테스트 계정 정보"
            description={
              <div>
                <p><strong>테스트 계정:</strong></p>
                <p>이메일: user@moyak.com</p>
                <p>비밀번호: user123</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        </div>
      )
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
        size="small"
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title 
            level={2} 
            style={{ 
              margin: 0, 
              color: '#1890ff'
            }}
          >
            MOYAK
          </Title>
          <Text 
            type="secondary" 
            style={{ 
              display: 'block',
              marginTop: '8px'
            }}
          >
            모두의 약속을 더 쉽게
          </Text>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <Collapse
            items={collapseItems}
            size="small"
            ghost
          />
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요.' },
              { type: 'email', message: '올바른 이메일 형식을 입력해주세요.' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일을 입력하세요"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호를 입력하세요"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', height: '48px' }}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">또는</Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            계정이 없으신가요?{' '}
            <Link to="/register" style={{ color: '#1890ff' }}>
              회원가입
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default Login; 