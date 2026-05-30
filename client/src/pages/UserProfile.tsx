import { useState } from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Upload, Divider, Tabs, Avatar, Tag, Table, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, UploadOutlined, CopyOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const user = {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    walletBalance: 250,
    referralCode: 'RAHUL250',
    joinedDate: '2026-01-15',
  };

  const walletTransactions = [
    { key: 1, date: '2026-05-14', type: 'Credit', amount: 50, description: 'Referral Bonus' },
    { key: 2, date: '2026-05-10', type: 'Debit', amount: 100, description: 'Order #ORD-1001' },
    { key: 3, date: '2026-05-05', type: 'Credit', amount: 200, description: 'Cashback Offer' },
    { key: 4, date: '2026-04-28', type: 'Credit', amount: 100, description: 'Welcome Bonus' },
  ];

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile',
      children: (
        <Card style={{ borderRadius: 12 }}>
          <div className="text-center mb-4">
            <Upload showUploadList={false}>
              <Avatar size={100} icon={<UserOutlined />} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
            </Upload>
            <Title level={4} className="mt-2 mb-0">{user.name}</Title>
            <Text type="secondary">Member since {user.joinedDate}</Text>
          </div>
          <Form layout="vertical" size="large" initialValues={{ name: user.name, email: user.email, phone: user.phone }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Full Name"><Input prefix={<UserOutlined />} /></Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email"><Input prefix={<MailOutlined />} /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="phone" label="Phone Number"><Input prefix={<PhoneOutlined />} /></Form.Item>
            <Button type="primary" shape="round" size="large" onClick={() => message.success('Profile updated!')}>Save Changes</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: 'Change Password',
      children: (
        <Card style={{ borderRadius: 12, maxWidth: 500 }}>
          <Title level={4}>Change Password</Title>
          <Form layout="vertical" size="large">
            <Form.Item name="current" label="Current Password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="new" label="New Password" rules={[{ required: true, min: 8 }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="confirm" label="Confirm Password" rules={[{ required: true }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Button type="primary" shape="round">Update Password</Button>
          </Form>
        </Card>
      ),
    },
    {
      key: 'wallet',
      label: 'Wallet',
      children: (
        <div>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginBottom: 16 }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Wallet Balance</Text>
                <Title level={1} style={{ color: 'white', margin: 0 }}>₹{user.walletBalance}.00</Title>
              </div>
              <WalletOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.5)' }} />
            </div>
          </Card>
          <Card title="Transaction History" style={{ borderRadius: 12 }}>
            <Table dataSource={walletTransactions} pagination={false} size="small" columns={[
              { title: 'Date', dataIndex: 'date' },
              { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag color={t === 'Credit' ? 'green' : 'red'}>{t}</Tag> },
              { title: 'Amount', dataIndex: 'amount', render: (v: number, r: typeof walletTransactions[0]) => <Text style={{ color: r.type === 'Credit' ? '#52c41a' : '#ff4d4f' }}>{r.type === 'Credit' ? '+' : '-'}₹{v}</Text> },
              { title: 'Description', dataIndex: 'description' },
            ]} />
          </Card>
        </div>
      ),
    },
    {
      key: 'referral',
      label: 'Referrals',
      children: (
        <Card style={{ borderRadius: 12, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <Title level={3}>Share & Earn</Title>
          <Text type="secondary">Share your referral code and earn ₹50 for each friend who signs up!</Text>
          <div className="mt-4 p-3" style={{ background: '#f0f5ff', borderRadius: 12, border: '2px dashed #1890ff' }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{user.referralCode}</Title>
          </div>
          <Button type="primary" icon={<CopyOutlined />} shape="round" className="mt-3" onClick={() => { navigator.clipboard.writeText(user.referralCode); message.success('Code copied!'); }}>
            Copy Code
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <Title level={2}>My Profile</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} tabPosition="left" style={{ minHeight: 400 }} />
    </div>
  );
};

export default UserProfile;
