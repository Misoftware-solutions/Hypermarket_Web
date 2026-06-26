import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, MobileOutlined, KeyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, sendOtp, verifyOtp } from '../services/api';
const {
  Title,
  Text
} = Typography;
const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loginMode, setLoginMode] = useState('password'); // 'password' or 'otp'
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState('');
  const [otpForm] = Form.useForm();
  const [mobileForm] = Form.useForm();

  const onFinishPassword = async values => {
    setLoading(true);
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password
      });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Login successful!');
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async values => {
    setLoading(true);
    try {
      const response = await sendOtp({ mobile: values.mobile });
      setMobile(values.mobile);
      setOtpSent(true);
      
      // In development or if OTP is returned in the API, we inform the user to check console or we show it
      if (response.data.otp) {
        message.success(`OTP sent! For testing, use code: ${response.data.otp}`);
        console.log(`[TESTING] OTP sent to ${values.mobile}: ${response.data.otp}`);
      } else {
        message.success('OTP sent successfully!');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send OTP. Is your mobile number registered?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async values => {
    setLoading(true);
    try {
      const response = await verifyOtp({
        mobile: mobile,
        otp: values.otp
      });
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      message.success('Login successful!');
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="d-flex justify-content-center align-items-center" style={{
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }}>
      <Card style={{
      width: 420,
      borderRadius: 16,
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
    }}>
        {loginMode === 'password' ? (
          <>
            <div className="text-center mb-4">
              <Title level={2} style={{
              color: '#1890ff',
              marginBottom: 4
            }}>Welcome Back</Title>
              <Text type="secondary">Sign in to your Hypermarket account</Text>
            </div>

            <Form name="login" onFinish={onFinishPassword} layout="vertical" size="large">
              <Form.Item name="email" rules={[{
              required: true,
              message: 'Enter email or phone'
            }]}>
                <Input prefix={<MailOutlined />} placeholder="Email or Phone Number" />
              </Form.Item>

              <Form.Item name="password" rules={[{
              required: true,
              message: 'Enter your password'
            }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Password" />
              </Form.Item>

              <div className="d-flex justify-content-between mb-3">
                <Link to="/forgot-password" style={{
                fontSize: '0.85rem'
              }}>Forgot Password?</Link>
              </div>

              <Form.Item>
                <Button type="primary" htmlType="submit" block shape="round" style={{
                height: 48
              }} loading={loading}>
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider>or</Divider>

            <Button block shape="round" icon={<MobileOutlined />} onClick={() => setLoginMode('otp')} style={{
            height: 44,
            marginBottom: 16
          }}>
              Login with OTP
            </Button>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <Title level={2} style={{
              color: '#1890ff',
              marginBottom: 4
            }}>{otpSent ? 'Enter OTP' : 'OTP Sign In'}</Title>
              <Text type="secondary">
                {otpSent 
                  ? `Enter the 6-digit code sent to ${mobile}` 
                  : 'Verify your registered mobile number'
                }
              </Text>
            </div>

            {!otpSent ? (
              <Form form={mobileForm} name="mobile_otp" onFinish={handleSendOtp} layout="vertical" size="large">
                <Form.Item name="mobile" rules={[{
                required: true,
                message: 'Please enter your mobile number'
              }, {
                pattern: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit mobile number'
              }]}>
                  <Input prefix={<MobileOutlined />} placeholder="10-Digit Mobile Number" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block shape="round" style={{
                  height: 48
                }} loading={loading}>
                    Send OTP
                  </Button>
                </Form.Item>

                <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => setLoginMode('password')} style={{ padding: 0, height: 'auto' }}>
                  Back to Password Login
                </Button>
              </Form>
            ) : (
              <Form form={otpForm} name="verify_otp" onFinish={handleVerifyOtp} layout="vertical" size="large">
                <Form.Item name="otp" rules={[{
                required: true,
                message: 'Please enter the OTP'
              }, {
                len: 6,
                message: 'OTP must be exactly 6 digits'
              }]}>
                  <Input prefix={<KeyOutlined />} placeholder="6-Digit OTP Code" maxLength={6} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block shape="round" style={{
                  height: 48
                }} loading={loading}>
                    Verify & Login
                  </Button>
                </Form.Item>

                <div className="d-flex justify-content-between">
                  <Button type="link" onClick={() => { setOtpSent(false); otpForm.resetFields(); }} style={{ padding: 0, height: 'auto' }}>
                    Edit Phone Number
                  </Button>
                  <Button type="link" onClick={() => handleSendOtp({ mobile })} style={{ padding: 0, height: 'auto' }}>
                    Resend OTP
                  </Button>
                </div>
              </Form>
            )}
          </>
        )}

        <div className="text-center mt-3">
          <Text type="secondary">Don't have an account? </Text>
          <Link to="/register" style={{
          fontWeight: 600
        }}>Register</Link>
        </div>
      </Card>
    </div>;
};
export default Login;