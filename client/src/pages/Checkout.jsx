import { useState, useEffect } from 'react';
import { Steps, Card, Radio, Button, Typography, Divider, Form, Input, Select, Row, Col, Tag, Space, Spin, Modal, Tabs, message } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CreditCardOutlined, CheckCircleOutlined, LockOutlined, QrcodeOutlined, BankOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, getCustomerById, createOrder, addCustomerAddress, getSettings } from '../services/api';

const {
  Title,
  Text
} = Typography;

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [confirmedOrderNum, setConfirmedOrderNum] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('slot1');
  const [storeSettings, setStoreSettings] = useState({
    default_tax: 5,
    free_delivery_threshold: 500,
    delivery_charge: 40,
    express_delivery_charge: 30,
    min_order_amount: 200,
  });

  // Dummy Payment Gateway Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [addressForm] = Form.useForm();
  const [savingAddress, setSavingAddress] = useState(false);

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      message.error('Please login to checkout');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [cartRes, customerRes, settingsRes] = await Promise.all([
          getCart(user.id),
          getCustomerById(user.id),
          getSettings().catch(() => ({ data: {} }))
        ]);

        if (settingsRes && settingsRes.data) {
          setStoreSettings({
            default_tax: Number(settingsRes.data.default_tax || 5),
            free_delivery_threshold: Number(settingsRes.data.free_delivery_threshold || 500),
            delivery_charge: Number(settingsRes.data.delivery_charge || 40),
            express_delivery_charge: Number(settingsRes.data.express_delivery_charge || 30),
            min_order_amount: Number(settingsRes.data.min_order_amount || 200),
          });
        }

        // Load cart items
        const items = (cartRes.data.items || []).map(item => ({
          product_id: item.product_id,
          name: item.product_name,
          qty: Number(item.qty),
          price: Number(item.selling_price),
          size: item.size
        }));
        setCartItems(items);

        // Load addresses
        const addrs = (customerRes.data.addresses || []).map(addr => ({
          id: addr.address_id,
          label: addr.label,
          address: addr.address_line1 + (addr.address_line2 ? `, ${addr.address_line2}` : ''),
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          isDefault: addr.is_default?.data ? addr.is_default.data[0] === 1 : addr.is_default === 1
        }));

        if (addrs.length === 0) {
          addrs.push({
            id: 1,
            label: 'Home',
            address: '123, MG Road, Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560034',
            isDefault: true
          });
        }
        
        setAddresses(addrs);
        const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      } catch (err) {
        message.error('Failed to load checkout details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const subtotal = cartItems.reduce((s, item) => s + item.price * item.qty, 0);
  const tax = Math.round(subtotal * (storeSettings.default_tax / 100));
  const baseDelivery = subtotal > storeSettings.free_delivery_threshold ? 0 : storeSettings.delivery_charge;
  const expressFee = selectedSlot === 'slot1' ? storeSettings.express_delivery_charge : 0;
  const delivery = baseDelivery + expressFee;
  const total = subtotal + tax + delivery;

  const slotLabels = {
    slot1: 'Express (1-2 hrs)',
    slot2: 'Today (4-6 hrs)',
    slot3: 'Tomorrow (9 AM - 12 PM)',
    slot4: 'Tomorrow (2 PM - 5 PM)'
  };

  const handleSaveAddress = async (values) => {
    setSavingAddress(true);
    try {
      const res = await addCustomerAddress(user.id, values);
      const newAddr = {
        id: res.data.address.address_id,
        label: values.label || 'Home',
        address: values.address_line1 + (values.address_line2 ? `, ${values.address_line2}` : ''),
        city: values.city,
        state: values.state || 'Karnataka',
        pincode: values.pincode,
        isDefault: false
      };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddress(newAddr.id);
      addressForm.resetFields();
      message.success('Address saved successfully!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const executeOrderSubmission = async () => {
    setSubmitting(true);
    try {
      const orderData = {
        customer_id: user.id,
        delivery_address_id: selectedAddress,
        payment_method: paymentMethod,
        delivery_slot: slotLabels[selectedSlot] || 'Express (1-2 hrs)',
        subtotal,
        tax_amount: tax,
        delivery_charge: delivery,
        grand_total: total,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          qty: item.qty,
          unit_price: item.price
        }))
      };

      const res = await createOrder(orderData);
      setConfirmedOrderNum(res.data.order_number);
      setOrderPlaced(true);
      message.success('Order placed successfully!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to place order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitiateOrder = () => {
    if (cartItems.length === 0) {
      message.warning('Your cart is empty');
      return;
    }

    if (paymentMethod === 'online') {
      setPaymentModalOpen(true);
    } else {
      executeOrderSubmission();
    }
  };

  const handleSimulateSuccess = () => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentModalOpen(false);
      executeOrderSubmission();
    }, 1500);
  };

  if (loading) {
    return <div className="text-center py-5" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  if (orderPlaced) {
    return <div className="d-flex flex-column align-items-center justify-content-center" style={{
      minHeight: 'calc(100vh - 64px)'
    }}>
        <CheckCircleOutlined style={{
        fontSize: 80,
        color: '#52c41a'
      }} />
        <Title level={2} className="mt-3">Order Placed Successfully!</Title>
        <Text type="secondary" style={{
        fontSize: '1.1rem'
      }}>Your order #{confirmedOrderNum} has been confirmed</Text>
        <Text type="secondary" className="mb-4">Estimated delivery: {slotLabels[selectedSlot]}</Text>
        <Space size="large">
          <Link to="/orders"><Button type="primary" size="large" shape="round">Track Order</Button></Link>
          <Link to="/"><Button size="large" shape="round">Continue Shopping</Button></Link>
        </Space>
      </div>;
  }

  const steps = [{
    title: 'Delivery Address',
    icon: <EnvironmentOutlined />,
    content: <div>
          <Radio.Group value={selectedAddress} onChange={e => setSelectedAddress(e.target.value)} className="w-100">
            <Row gutter={16}>
              {addresses.map(addr => <Col xs={24} md={12} key={addr.id}>
                  <Radio value={addr.id} className="w-100 mb-3">
                    <Card size="small" style={{
                borderRadius: 10,
                border: selectedAddress === addr.id ? '2px solid #1890ff' : undefined,
                cursor: 'pointer'
              }}>
                      <div className="d-flex justify-content-between">
                        <Tag color={addr.label === 'Home' ? 'blue' : 'green'}>{addr.label}</Tag>
                        {addr.isDefault && <Tag color="gold">Default</Tag>}
                      </div>
                      <Text className="d-block mt-2">{addr.address}</Text>
                      <Text type="secondary">{addr.city}, {addr.state} - {addr.pincode}</Text>
                    </Card>
                  </Radio>
                </Col>)}
            </Row>
          </Radio.Group>
          <Divider />
          <Title level={5}>Add New Address</Title>
          <Form form={addressForm} layout="vertical" size="large" onFinish={handleSaveAddress}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="label" label="Label" initialValue="Home">
                  <Select options={[{ value: 'Home', label: 'Home' }, { value: 'Work', label: 'Work' }, { value: 'Other', label: 'Other' }]} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city' }]}>
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="pincode" label="Pincode" rules={[{ required: true, message: 'Please enter pincode' }]}>
                  <Input placeholder="Pincode" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="address_line1" label="Address Line 1" rules={[{ required: true, message: 'Please enter address' }]}>
              <Input placeholder="Flat / House No., Floor, Building Name" />
            </Form.Item>
            <Button type="dashed" htmlType="submit" loading={savingAddress} block>+ Save & Select Address</Button>
          </Form>
        </div>
  }, {
    title: 'Delivery Slot',
    icon: <ClockCircleOutlined />,
    content: <div>
          <Title level={5}>Choose Delivery Time</Title>
          <Radio.Group value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} className="w-100">
            <Row gutter={[16, 16]}>
              {[{
            key: 'slot1',
            label: 'Express (1-2 hrs)',
            desc: 'Fastest delivery',
            extra: '₹30'
          }, {
            key: 'slot2',
            label: 'Today (4-6 hrs)',
            desc: 'Same day delivery',
            extra: 'FREE'
          }, {
            key: 'slot3',
            label: 'Tomorrow (9 AM - 12 PM)',
            desc: 'Morning slot',
            extra: 'FREE'
          }, {
            key: 'slot4',
            label: 'Tomorrow (2 PM - 5 PM)',
            desc: 'Afternoon slot',
            extra: 'FREE'
          }].map(slot => <Col xs={24} sm={12} key={slot.key}>
                  <Radio value={slot.key} className="w-100">
                    <Card size="small" style={{
                borderRadius: 10
              }}>
                      <div className="d-flex justify-content-between"><Text strong>{slot.label}</Text><Tag color={slot.extra === 'FREE' ? 'green' : 'orange'}>{slot.extra}</Tag></div>
                      <Text type="secondary">{slot.desc}</Text>
                    </Card>
                  </Radio>
                </Col>)}
            </Row>
          </Radio.Group>
        </div>
  }, {
    title: 'Payment',
    icon: <CreditCardOutlined />,
    content: <div>
          <Title level={5}>Select Payment Method</Title>
          <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-100">
            <Space direction="vertical" className="w-100" size="middle">
              {[{
            key: 'online',
            label: 'Online Payment (Simulated)',
            desc: 'Pay via UPI, Cards, or Net Banking'
          }, {
            key: 'cod',
            label: 'Cash on Delivery',
            desc: 'Pay cash when your order is delivered'
          }, {
            key: 'wallet',
            label: 'Wallet Balance',
            desc: 'Available Balance: ₹250.00'
          }].map(pm => <Radio value={pm.key} key={pm.key} className="w-100">
                  <Card size="small" style={{
              borderRadius: 10,
              width: '100%',
              border: paymentMethod === pm.key ? '2px solid #1890ff' : undefined
            }}>
                    <Text strong>{pm.label}</Text>
                    <br />
                    <Text type="secondary">{pm.desc}</Text>
                  </Card>
                </Radio>)}
            </Space>
          </Radio.Group>
        </div>
  }];

  return <div style={{
    padding: '20px 50px'
  }}>
      <Title level={2}>Checkout</Title>
      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card style={{
          borderRadius: 12
        }}>
            <Steps current={currentStep} items={steps.map(s => ({
            title: s.title,
            icon: s.icon
          }))} className="mb-4" />
            <div style={{
            minHeight: 300
          }}>{steps[currentStep].content}</div>
            <Divider />
            <div className="d-flex justify-content-between">
              <Button disabled={currentStep === 0} onClick={() => setCurrentStep(c => c - 1)}>Previous</Button>
              {currentStep < steps.length - 1 ? <Button type="primary" onClick={() => setCurrentStep(c => c + 1)}>Next</Button> : <Button type="primary" size="large" onClick={handleInitiateOrder} loading={submitting} style={{
              height: 48,
              paddingInline: 40
            }}>Place Order — ₹{total}</Button>}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Order Summary" style={{
          borderRadius: 12,
          position: 'sticky',
          top: 80
        }}>
            {cartItems.map((item, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <Text>{item.name} × {item.qty}</Text>
                  {item.size && <div style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>Size: {item.size}</div>}
                </div>
                <Text>₹{item.price * item.qty}</Text>
              </div>
            ))}
            <Divider />
            <div className="d-flex justify-content-between mb-1"><Text>Subtotal</Text><Text>₹{subtotal}</Text></div>
            <div className="d-flex justify-content-between mb-1"><Text>Tax ({storeSettings.default_tax}%)</Text><Text>₹{tax}</Text></div>
            <div className="d-flex justify-content-between mb-1"><Text>Delivery</Text>{delivery === 0 ? <Tag color="green">FREE</Tag> : <Text>₹{delivery}</Text>}</div>
            <Divider />
            <div className="d-flex justify-content-between"><Title level={4} style={{
              margin: 0
            }}>Total</Title><Title level={4} style={{
              margin: 0,
              color: '#1890ff'
            }}>₹{total}</Title></div>
          </Card>
        </Col>
      </Row>

      {/* Dummy Payment Gateway Modal */}
      <Modal
        title={<div className="d-flex align-items-center gap-2"><LockOutlined style={{ color: '#52c41a' }} /> Dummy Payment Gateway</div>}
        open={paymentModalOpen}
        onCancel={() => !paymentProcessing && setPaymentModalOpen(false)}
        footer={null}
        centered
        width={480}
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>Total Payable: ₹{total}</Tag>
          <Text type="secondary" className="d-block mt-2">Choose dummy payment method to test checkout completion:</Text>
        </div>

        <Tabs
          defaultActiveKey="card"
          centered
          items={[
            {
              key: 'card',
              label: <span><CreditCardOutlined /> Card</span>,
              children: (
                <Space direction="vertical" className="w-100 mt-2">
                  <Input placeholder="Card Number (4532 XXXX XXXX 8900)" defaultValue="4532 •••• •••• 8900" disabled />
                  <Row gutter={12}>
                    <Col span={12}><Input placeholder="MM/YY" defaultValue="12/28" disabled /></Col>
                    <Col span={12}><Input placeholder="CVV" defaultValue="789" disabled /></Col>
                  </Row>
                  <Input placeholder="Cardholder Name" defaultValue="John Doe" disabled />
                </Space>
              )
            },
            {
              key: 'upi',
              label: <span><QrcodeOutlined /> UPI / QR</span>,
              children: (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ background: '#f5f5f5', display: 'inline-block', padding: 16, borderRadius: 12 }}>
                    <QrcodeOutlined style={{ fontSize: 100, color: '#1890ff' }} />
                  </div>
                  <Text className="d-block mt-2" strong>Scan or enter UPI ID: user@upi</Text>
                </div>
              )
            },
            {
              key: 'netbanking',
              label: <span><BankOutlined /> Net Banking</span>,
              children: (
                <Select
                  className="w-100 mt-2"
                  defaultValue="sbi"
                  options={[
                    { value: 'sbi', label: 'State Bank of India' },
                    { value: 'hdfc', label: 'HDFC Bank' },
                    { value: 'icici', label: 'ICICI Bank' },
                    { value: 'axis', label: 'Axis Bank' }
                  ]}
                />
              )
            }
          ]}
        />

        <Divider style={{ margin: '16px 0' }} />

        <Space direction="vertical" className="w-100" size="middle">
          <Button
            type="primary"
            size="large"
            block
            loading={paymentProcessing}
            onClick={handleSimulateSuccess}
            style={{ background: '#52c41a', borderColor: '#52c41a', height: 44, fontWeight: 600 }}
          >
            Simulate Successful Payment (₹{total})
          </Button>

          <Button
            danger
            block
            disabled={paymentProcessing}
            onClick={() => {
              message.error('Payment cancelled / failed');
              setPaymentModalOpen(false);
            }}
          >
            Cancel / Fail Payment
          </Button>
        </Space>
      </Modal>
    </div>;
};

export default Checkout;