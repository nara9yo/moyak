import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Space, Alert, Collapse } from 'antd';
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

  const from = location.state?.from?.pathname || '/dashboard';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // 테스트용 계정으로 빠른 로그인
  const quickLogin = async (email, password) => {
    form.setFieldsValue({ email, password });
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      }
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
          <Text strong>테스트용 계정 정보</Text>
        </Space>
      ),
      children: (
        <div>
          <Alert
            message="프론트엔드 테스트용 계정"
            description={
              <div>
                <p><strong>관리자 계정:</strong></p>
                <p>이메일: admin@moyak.com</p>
                <p>비밀번호: admin123</p>
                <br />
                <p><strong>일반 사용자 계정:</strong></p>
                <p>이메일: user@moyak.com</p>
                <p>비밀번호: user123</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button 
              type="primary" 
              ghost 
              onClick={() => quickLogin('admin@moyak.com', 'admin123')}
              loading={loading}
              style={{ width: '100%' }}
            >
              관리자로 빠른 로그인
            </Button>
            <Button 
              type="default" 
              onClick={() => quickLogin('user@moyak.com', 'user123')}
              loading={loading}
              style={{ width: '100%' }}
            >
              일반 사용자로 빠른 로그인
            </Button>
          </Space>
        </div>
      )
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            모약 (MOYAK)
          </Title>
          <Text type="secondary">모두의 약속, 쉽고 효율적인 스케줄링</Text>
        </div>

        {/* 테스트용 계정 정보 */}
        <Collapse 
          ghost 
          style={{ marginBottom: '24px' }}
          expandIconPosition="end"
          items={collapseItems}
        />

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요.' },
              { type: 'email', message: '유효한 이메일을 입력해주세요.' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력해주세요.' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              로그인
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">또는</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Text style={{ textAlign: 'center', display: 'block' }}>
            계정이 없으신가요?{' '}
            <Link to="/register" style={{ color: '#1890ff' }}>
              회원가입
            </Link>
          </Text>
        </Space>
      </Card>
    </div>
  );
};

export default Login; 