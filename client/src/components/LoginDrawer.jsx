import { useState } from 'react';
import { Drawer, Form, Input, Button, Tabs, Typography, message, Tag } from 'antd';
import { MailOutlined, LockOutlined, MobileOutlined, KeyOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useAuthModal } from '../context/AuthModalContext';
import { loginUser, sendOtp, verifyOtp, registerUser } from '../services/api';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const LoginDrawer = () => {
  const { isOpen, messageText, closeAuthDrawer, handleSuccess } = useAuthModal();
  const [activeTab, setActiveTab] = useState('login');
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState('');

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const onFinishPassword = async (values) => {
    setLoading(true);
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password
      });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Logged in successfully!');
      window.dispatchEvent(new Event('cartChange'));
      handleSuccess(response.data.user);
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (values) => {
    setLoading(true);
    try {
      const response = await sendOtp({ mobile: values.mobile });
      setMobile(values.mobile);
      setOtpSent(true);
      if (response.data.otp) {
        message.success(`OTP sent! Code: ${response.data.otp}`);
      } else {
        message.success('OTP sent successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values) => {
    setLoading(true);
    try {
      const response = await verifyOtp({
        mobile: mobile,
        otp: values.otp
      });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Logged in successfully!');
      window.dispatchEvent(new Event('cartChange'));
      handleSuccess(response.data.user);
    } catch (error) {
      message.error(error.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishRegister = async (values) => {
    setLoading(true);
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'customer'
      });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Registration successful! Welcome to Hypermarket.');
      window.dispatchEvent(new Event('cartChange'));
      handleSuccess(response.data.user);
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title={null}
      placement="left"
      onClose={closeAuthDrawer}
      open={isOpen}
      width={420}
      rootClassName="left-login-drawer-root"
      maskClassName="left-login-drawer-mask"
      styles={{ body: { padding: '24px 28px' } }}
    >
      <div className="text-center mb-4">
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 8px 20px rgba(24, 144, 255, 0.3)',
          marginBottom: 12
        }}>
          <ShoppingOutlined style={{ fontSize: 28 }} />
        </div>
        <Title level={3} style={{ marginBottom: 4 }}>Hypermarket</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {messageText}
        </Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={[
          {
            key: 'login',
            label: 'Log In',
            children: (
              <div>
                <div className="d-flex justify-content-center mb-3">
                  <Button
                    type={loginMode === 'password' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => { setLoginMode('password'); setOtpSent(false); }}
                    style={{ borderRadius: '6px 0 0 6px' }}
                  >
                    Password
                  </Button>
                  <Button
                    type={loginMode === 'otp' ? 'primary' : 'default'}
                    size="small"
                    onClick={() => { setLoginMode('otp'); setOtpSent(false); }}
                    style={{ borderRadius: '0 6px 6px 0' }}
                  >
                    OTP Login
                  </Button>
                </div>

                {loginMode === 'password' ? (
                  <Form form={loginForm} layout="vertical" onFinish={onFinishPassword}>
                    <Form.Item
                      name="email"
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Enter a valid email' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
                    </Form.Item>

                    <Form.Item
                      name="password"
                      rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                        Log In & Continue
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  <div>
                    {!otpSent ? (
                      <Form layout="vertical" onFinish={handleSendOtp}>
                        <Form.Item
                          name="mobile"
                          rules={[
                            { required: true, message: 'Please enter your mobile number' },
                            { pattern: /^[0-9]{10}$/, message: 'Enter 10-digit mobile number' }
                          ]}
                        >
                          <Input prefix={<MobileOutlined />} placeholder="10-digit Mobile Number" size="large" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                          Send OTP
                        </Button>
                      </Form>
                    ) : (
                      <Form layout="vertical" onFinish={handleVerifyOtp}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                          OTP sent to +91 {mobile}
                        </Text>
                        <Form.Item
                          name="otp"
                          rules={[{ required: true, message: 'Please enter OTP' }]}
                        >
                          <Input prefix={<KeyOutlined />} placeholder="Enter 6-digit OTP" size="large" maxLength={6} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                          Verify & Continue
                        </Button>
                        <Button type="link" size="small" onClick={() => setOtpSent(false)} block style={{ marginTop: 8 }}>
                          Change Mobile Number
                        </Button>
                      </Form>
                    )}
                  </div>
                )}
              </div>
            )
          },
          {
            key: 'register',
            label: 'New Account',
            children: (
              <Form form={registerForm} layout="vertical" onFinish={onFinishRegister}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please enter your full name' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email Address" size="large" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input prefix={<MobileOutlined />} placeholder="Mobile Number" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please set a password' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Create Password" size="large" />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" block loading={loading}>
                  Create Account & Continue
                </Button>
              </Form>
            )
          }
        ]}
      />
    </Drawer>
  );
};

export default LoginDrawer;
