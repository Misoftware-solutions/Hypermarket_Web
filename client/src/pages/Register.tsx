import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    try {
      const response = await registerUser(values);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Registration successful!');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
      <Card style={{ width: 450, borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="text-center mb-4">
          <Title level={2} style={{ color: '#f5576c', marginBottom: 4 }}>Create Account</Title>
          <Text type="secondary">Join Hypermarket for the best deals</Text>
        </div>

        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="full_name" rules={[{ required: true, message: 'Enter your name' }]}>
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Email Address" />
          </Form.Item>

          <Form.Item name="phone" rules={[{ required: true, message: 'Enter your phone number' }]}>
            <Input prefix={<MobileOutlined />} placeholder="Phone Number" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 8, message: 'Password must be at least 8 characters' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item name="confirm_password" dependencies={['password']} rules={[
            { required: true, message: 'Confirm your password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) return Promise.resolve();
                return Promise.reject(new Error('Passwords do not match'));
              },
            }),
          ]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item name="referral_code">
            <Input placeholder="Referral Code (optional)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block shape="round" style={{ height: 48, background: '#f5576c', borderColor: '#f5576c' }} loading={loading}>
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="text-center">
          <Text type="secondary">Already have an account? </Text>
          <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
