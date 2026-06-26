import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Upload, Tabs, Avatar, Tag, Table, Spin, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, CopyOutlined, WalletOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCustomerById, updateCustomer } from '../services/api';

const {
  Title,
  Text
} = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      message.error('Please login to view your profile');
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await getCustomerById(user.id);
        const customer = res.data;
        const mapped = {
          name: customer.customer_name,
          email: customer.email,
          phone: customer.mobile || '',
          walletBalance: Number(customer.wallet_balance || 0),
          referralCode: customer.referral_code || 'NEWMEMBER',
          joinedDate: new Date(customer.created_at).toISOString().split('T')[0]
        };
        setProfileUser(mapped);
        form.setFieldsValue({
          name: mapped.name,
          email: mapped.email,
          phone: mapped.phone
        });
      } catch (err) {
        message.error('Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await updateCustomer(user.id, {
        customer_name: values.name,
        email: values.email,
        mobile: values.phone
      });
      const updatedSession = { ...user, name: values.name, email: values.email };
      sessionStorage.setItem('user', JSON.stringify(updatedSession));
      
      setProfileUser(prev => ({
        ...prev,
        name: values.name,
        email: values.email,
        phone: values.phone
      }));
      message.success('Profile updated successfully!');
    } catch (err) {
      message.error('Failed to update profile');
    }
  };

  const walletTransactions = [{
    key: 1,
    date: '2026-05-14',
    type: 'Credit',
    amount: 50,
    description: 'Referral Bonus'
  }, {
    key: 2,
    date: '2026-05-10',
    type: 'Debit',
    amount: 100,
    description: 'Order Payment'
  }, {
    key: 3,
    date: '2026-05-05',
    type: 'Credit',
    amount: 200,
    description: 'Cashback Offer'
  }];

  if (loading) {
    return <div className="text-center py-5" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  if (!profileUser) {
    return <div className="text-center py-5"><Title level={4}>Profile not found</Title></div>;
  }

  const tabItems = [{
    key: 'profile',
    label: 'Profile',
    children: <Card style={{
      borderRadius: 12
    }}>
          <div className="text-center mb-4">
            <Upload showUploadList={false}>
              <Avatar size={100} icon={<UserOutlined />} style={{
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #667eea, #764ba2)'
          }} />
            </Upload>
            <Title level={4} className="mt-2 mb-0">{profileUser.name}</Title>
            <Text type="secondary">Member since {profileUser.joinedDate}</Text>
          </div>
          <Form form={form} layout="vertical" size="large">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter name' }]}><Input prefix={<UserOutlined />} /></Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}><Input prefix={<MailOutlined />} /></Form.Item>
              </Col>
            </Row>
            <Form.Item name="phone" label="Phone Number"><Input prefix={<PhoneOutlined />} /></Form.Item>
            <Button type="primary" shape="round" size="large" onClick={handleSave}>Save Changes</Button>
          </Form>
        </Card>
  }, {
    key: 'password',
    label: 'Change Password',
    children: <Card style={{
      borderRadius: 12,
      maxWidth: 500
    }}>
          <Title level={4}>Change Password</Title>
          <Form layout="vertical" size="large">
            <Form.Item name="current" label="Current Password" rules={[{
          required: true
        }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="new" label="New Password" rules={[{
          required: true,
          min: 8
        }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item name="confirm" label="Confirm Password" rules={[{
          required: true
        }]}>
              <Input.Password prefix={<LockOutlined />} />
            </Form.Item>
            <Button type="primary" shape="round">Update Password</Button>
          </Form>
        </Card>
  }, {
    key: 'wallet',
    label: 'Wallet',
    children: <div>
          <Card style={{
        borderRadius: 12,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginBottom: 16
      }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Text style={{
              color: 'rgba(255,255,255,0.8)'
            }}>Wallet Balance</Text>
                <Title level={1} style={{
              color: 'white',
              margin: 0
            }}>₹{profileUser.walletBalance}.00</Title>
              </div>
              <WalletOutlined style={{
            fontSize: 48,
            color: 'rgba(255,255,255,0.5)'
          }} />
            </div>
          </Card>
          <Card title="Transaction History" style={{
        borderRadius: 12
      }}>
            <Table dataSource={walletTransactions} pagination={false} size="small" columns={[{
          title: 'Date',
          dataIndex: 'date'
        }, {
          title: 'Type',
          dataIndex: 'type',
          render: t => <Tag color={t === 'Credit' ? 'green' : 'red'}>{t}</Tag>
        }, {
          title: 'Amount',
          dataIndex: 'amount',
          render: (v, r) => <Text style={{
            color: r.type === 'Credit' ? '#52c41a' : '#ff4d4f'
          }}>{r.type === 'Credit' ? '+' : '-'}₹{v}</Text>
        }, {
          title: 'Description',
          dataIndex: 'description'
        }]} />
          </Card>
        </div>
  }, {
    key: 'referral',
    label: 'Referrals',
    children: <Card style={{
      borderRadius: 12,
      textAlign: 'center',
      maxWidth: 500,
      margin: '0 auto'
    }}>
          <Title level={3}>Share & Earn</Title>
          <Text type="secondary">Share your referral code and earn ₹50 for each friend who signs up!</Text>
          <div className="mt-4 p-3" style={{
        background: '#f0f5ff',
        borderRadius: 12,
        border: '2px dashed #1890ff'
      }}>
            <Title level={2} style={{
          color: '#1890ff',
          margin: 0
        }}>{profileUser.referralCode}</Title>
          </div>
          <Button type="primary" icon={<CopyOutlined />} shape="round" className="mt-3" onClick={() => {
        navigator.clipboard.writeText(profileUser.referralCode);
        message.success('Code copied!');
      }}>
            Copy Code
          </Button>
        </Card>
  }];

  return <div style={{
    padding: '20px 50px'
  }}>
      <Title level={2}>My Profile</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} tabPosition="left" style={{
      minHeight: 400
    }} />
    </div>;
};
export default UserProfile;