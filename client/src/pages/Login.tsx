import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await loginUser({ email: values.email, password: values.password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Login successful!');
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 420, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="text-center mb-4">
          <Title level={2} style={{ color: '#1890ff', marginBottom: 4 }}>Welcome Back</Title>
          <Text type="secondary">Sign in to your Hypermarket account</Text>
        </div>

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Enter email or phone' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email or Phone Number" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>Forgot Password?</Link>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block shape="round" style={{ height: 48 }} loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>or</Divider>

        <Button block shape="round" icon={<MobileOutlined />} style={{ height: 44, marginBottom: 16 }}>
          Login with OTP
        </Button>

        <div className="text-center">
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register" style={{ fontWeight: 600 }}>Register</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
