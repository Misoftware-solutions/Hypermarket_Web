import { Layout, Row, Col, Typography, Space, Divider } from 'antd';
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  const location = useLocation();

  // Hide footer on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <AntFooter style={{ background: '#001529', color: 'rgba(255,255,255,0.65)', padding: '40px 50px 20px' }}>
      <Row gutter={[32, 32]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} style={{ color: '#fff' }}>🛒 HYPERMARKET</Title>
          <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
            Your one-stop shop for fresh groceries, dairy, bakery items, and more. Quality products delivered to your doorstep.
          </Text>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={5} style={{ color: '#fff' }}>Quick Links</Title>
          <Space direction="vertical">
            <Link to="/" style={{ color: 'rgba(255,255,255,0.65)' }}>Home</Link>
            <Link to="/products" style={{ color: 'rgba(255,255,255,0.65)' }}>Products</Link>
            <Link to="/cart" style={{ color: 'rgba(255,255,255,0.65)' }}>Cart</Link>
            <Link to="/orders" style={{ color: 'rgba(255,255,255,0.65)' }}>My Orders</Link>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={5} style={{ color: '#fff' }}>Customer Service</Title>
          <Space direction="vertical">
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>About Us</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Privacy Policy</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Terms & Conditions</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Return Policy</Text>
          </Space>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Title level={5} style={{ color: '#fff' }}>Contact Us</Title>
          <Space direction="vertical">
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}><PhoneOutlined /> +91 98765 43210</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}><MailOutlined /> support@hypermarket.com</Text>
            <Text style={{ color: 'rgba(255,255,255,0.65)' }}><EnvironmentOutlined /> Bangalore, India</Text>
          </Space>
        </Col>
      </Row>
      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <div className="text-center">
        <Text style={{ color: 'rgba(255,255,255,0.45)' }}>© 2026 Hypermarket. All rights reserved. Built with ❤️</Text>
      </div>
    </AntFooter>
  );
};

export default Footer;
