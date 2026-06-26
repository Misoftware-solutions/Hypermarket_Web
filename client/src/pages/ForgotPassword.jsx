import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const {
  Title,
  Text
} = Typography;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async values => {
    setLoading(true);
    setTimeout(() => {
      message.success('Password reset link sent to your email!');
      setLoading(false);
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{
        width: 420,
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        <div className="text-center mb-4">
          <Title level={2} style={{
            color: '#1890ff',
            marginBottom: 4
          }}>Forgot Password</Title>
          <Text type="secondary">Enter your email to receive a password reset link</Text>
        </div>

        <Form name="forgot_password" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{
            required: true,
            type: 'email',
            message: 'Please enter a valid email address'
          }]}>
            <Input prefix={<MailOutlined />} placeholder="Email Address" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block shape="round" style={{
              height: 48
            }} loading={loading}>
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-3">
          <Link to="/login" className="d-flex align-items-center justify-content-center gap-1">
            <ArrowLeftOutlined /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
