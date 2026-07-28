import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Tabs, Avatar, Tag, Table, Spin, Modal, Space, Popconfirm, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, CopyOutlined, WalletOutlined, EnvironmentOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getCustomerById, updateCustomer, addCustomerAddress, deleteCustomerAddress, setCustomerDefaultAddress, updateCustomerAddress } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const UserProfile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileUser, setProfileUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submittingAddress, setSubmittingAddress] = useState(false);

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const fetchProfile = async () => {
    if (!user) return;
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
      setAddresses(customer.addresses || []);
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

  useEffect(() => {
    if (!user) {
      message.error('Please login to view your profile');
      navigate('/login');
      return;
    }
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

  const handleStartAdd = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setAddressModalOpen(true);
  };

  const handleStartEdit = (addr) => {
    setEditingAddress(addr);
    addressForm.setFieldsValue({
      label: addr.label || 'Home',
      address_line1: addr.address_line1,
      address_line2: addr.address_line2,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (values) => {
    setSubmittingAddress(true);
    try {
      if (editingAddress) {
        // Edit mode
        await updateCustomerAddress(user.id, editingAddress.address_id, values);
        message.success('Address updated successfully!');
      } else {
        // Add mode
        await addCustomerAddress(user.id, values);
        message.success('Address added successfully!');
      }
      setAddressModalOpen(false);
      addressForm.resetFields();
      fetchProfile(); // reload list
    } catch {
      message.error(editingAddress ? 'Failed to update address' : 'Failed to add address');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteCustomerAddress(user.id, addressId);
      setAddresses(prev => prev.filter(a => a.address_id !== addressId));
      message.success('Address deleted successfully!');
      window.dispatchEvent(new Event('cartChange'));
    } catch {
      message.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await setCustomerDefaultAddress(user.id, addressId);
      setAddresses(prev => prev.map(a => ({
        ...a,
        is_default: a.address_id === addressId ? 1 : 0
      })));
      message.success('Default address updated!');
      window.dispatchEvent(new Event('cartChange')); // Refresh delivery label in Navbar
    } catch {
      message.error('Failed to set default address');
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

  const tabItems = [
    {
      key: 'profile',
      label: 'Profile Info',
      children: (
        <Card style={{ borderRadius: 12 }}>
          <div className="text-center mb-4">
            <Avatar size={100} icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #1890ff, #096dd9)' }} />
            <Title level={4} className="mt-2 mb-0">{profileUser.name}</Title>
            <Text type="secondary">Member since {profileUser.joinedDate}</Text>
          </div>
          <Form form={form} layout="vertical" size="large">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter name' }]}>
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="phone" label="Phone Number">
              <Input prefix={<PhoneOutlined />} />
            </Form.Item>
            <Button type="primary" shape="round" size="large" onClick={handleSave}>Save Changes</Button>
          </Form>
        </Card>
      )
    },
    {
      key: 'addresses',
      label: 'Saved Addresses',
      children: (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Title level={4} style={{ margin: 0 }}>My Saved Addresses</Title>
            <Button type="primary" icon={<PlusOutlined />} shape="round" onClick={handleStartAdd}>
              Add Address
            </Button>
          </div>
          
          <Row gutter={[16, 16]}>
            {addresses.length === 0 ? (
              <Col span={24}>
                <Card style={{ textAlign: 'center', padding: '30px 0', borderRadius: 12 }}>
                  <EnvironmentOutlined style={{ fontSize: '40px', color: '#bfbfbf', marginBottom: '16px' }} />
                  <Paragraph type="secondary">You don't have any saved addresses yet.</Paragraph>
                  <Button type="primary" shape="round" onClick={handleStartAdd}>Add One Now</Button>
                </Card>
              </Col>
            ) : (
              addresses.map(addr => {
                const isDefault = addr.is_default?.data ? addr.is_default.data[0] === 1 : addr.is_default === 1;
                return (
                  <Col xs={24} sm={12} key={addr.address_id}>
                    <Card 
                      style={{ 
                        borderRadius: 12, 
                        border: isDefault ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        position: 'relative'
                      }}
                      actions={[
                        !isDefault ? (
                          <Button type="link" size="small" onClick={() => handleSetDefault(addr.address_id)}>
                            Set Default
                          </Button>
                        ) : (
                          <span style={{ color: '#52c41a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircleOutlined /> Default Address
                          </span>
                        ),
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleStartEdit(addr)}>
                          Edit
                        </Button>,
                        <Popconfirm
                          title="Are you sure you want to delete this address?"
                          onConfirm={() => handleDeleteAddress(addr.address_id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                            Delete
                          </Button>
                        </Popconfirm>
                      ]}
                    >
                      <Tag color={addr.label === 'Work' ? 'orange' : 'blue'} className="mb-2">
                        {addr.label || 'Home'}
                      </Tag>
                      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                        <div>{addr.address_line1}</div>
                        {addr.address_line2 && <div>{addr.address_line2}</div>}
                        <Text strong>{addr.city}, {addr.state} - {addr.pincode}</Text>
                      </div>
                    </Card>
                  </Col>
                );
              })
            )}
          </Row>
        </div>
      )
    },
    {
      key: 'wallet',
      label: 'Wallet Balance',
      children: (
        <div>
          <Card style={{ borderRadius: 12, background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', color: 'white', marginBottom: 16 }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Wallet Balance</Text>
                <Title level={1} style={{ color: 'white', margin: 0 }}>₹{profileUser.walletBalance}.00</Title>
              </div>
              <WalletOutlined style={{ fontSize: 48, color: 'rgba(255,255,255,0.4)' }} />
            </div>
          </Card>
          <Card title="Transaction History" style={{ borderRadius: 12 }}>
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
              render: (v, r) => <Text style={{ color: r.type === 'Credit' ? '#52c41a' : '#ff4d4f' }}>{r.type === 'Credit' ? '+' : '-'}₹{v}</Text>
            }, {
              title: 'Description',
              dataIndex: 'description'
            }]} />
          </Card>
        </div>
      )
    },
    {
      key: 'referral',
      label: 'Referrals',
      children: (
        <Card style={{ borderRadius: 12, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
          <Title level={3}>Share & Earn</Title>
          <Text type="secondary">Share your referral code and earn ₹50 for each friend who signs up!</Text>
          <div className="mt-4 p-3" style={{ background: '#f0f5ff', borderRadius: 12, border: '2px dashed #1890ff' }}>
            <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{profileUser.referralCode}</Title>
          </div>
          <Button type="primary" icon={<CopyOutlined />} shape="round" className="mt-3" onClick={() => {
            navigator.clipboard.writeText(profileUser.referralCode);
            message.success('Code copied!');
          }}>
            Copy Code
          </Button>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '30px 50px', background: '#f8f9fa', minHeight: '80vh' }}>
      <Title level={2} className="mb-4">My Profile</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} tabPosition="left" style={{ minHeight: 400 }} />

      {/* Add / Edit Address Modal */}
      <Modal
        title={<strong>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</strong>}
        open={addressModalOpen}
        onCancel={() => setAddressModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={addressForm} layout="vertical" onFinish={handleSaveAddress} size="large" initialValues={{ label: 'Home', state: 'Karnataka' }}>
          <Form.Item name="label" label="Address Label" rules={[{ required: true }]}>
            <Tabs 
              activeKey={addressForm.getFieldValue('label') || 'Home'} 
              onChange={key => addressForm.setFieldsValue({ label: key })} 
              items={[
                { key: 'Home', label: '🏠 Home' },
                { key: 'Work', label: '💼 Work' }
              ]} 
            />
          </Form.Item>
          <Form.Item name="address_line1" label="Street Address" rules={[{ required: true, message: 'Please enter street address' }]}>
            <Input placeholder="Flat, House no., Building, Company, Apartment" />
          </Form.Item>
          <Form.Item name="address_line2" label="Landmark / Area (Optional)">
            <Input placeholder="e.g. Near Apollo Hospital" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city' }]}>
                <Input placeholder="e.g. Bangalore" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="state" label="State" rules={[{ required: true }]}>
                <Input placeholder="e.g. Karnataka" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="pincode" label="Pincode" rules={[{ required: true, message: 'Please enter pincode' }]}>
            <Input placeholder="6-digit pincode" maxLength={6} />
          </Form.Item>
          <Form.Item>
            <Space className="w-100 justify-content-end mt-2">
              <Button onClick={() => setAddressModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submittingAddress}>
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;