import { useState, useEffect } from 'react';
import { Steps, Card, Radio, Button, Typography, Divider, Form, Input, Select, Row, Col, Tag, Space, Spin, message } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, getCustomerById, createOrder } from '../services/api';

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
        const [cartRes, customerRes] = await Promise.all([
          getCart(user.id),
          getCustomerById(user.id)
        ]);

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
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + delivery;

  const slotLabels = {
    slot1: 'Express (1-2 hrs)',
    slot2: 'Today (4-6 hrs)',
    slot3: 'Tomorrow (9 AM - 12 PM)',
    slot4: 'Tomorrow (2 PM - 5 PM)'
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      message.warning('Your cart is empty');
      return;
    }
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
                  <Radio value={addr.id} className="w-100">
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
          <Form layout="vertical" size="large">
            <Row gutter={16}>
              <Col xs={24} md={8}><Form.Item label="Label"><Select options={[{
                value: 'Home',
                label: 'Home'
              }, {
                value: 'Work',
                label: 'Work'
              }, {
                value: 'Other',
                label: 'Other'
              }]} /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="City"><Input placeholder="City" /></Form.Item></Col>
              <Col xs={24} md={8}><Form.Item label="Pincode"><Input placeholder="Pincode" /></Form.Item></Col>
            </Row>
            <Form.Item label="Address Line 1"><Input placeholder="Full address" /></Form.Item>
            <Button type="dashed" block>+ Save Address</Button>
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
            label: 'Online Payment',
            desc: 'Pay via Razorpay (UPI, Cards, Net Banking)'
          }, {
            key: 'cod',
            label: 'Cash on Delivery',
            desc: 'Pay when your order is delivered'
          }, {
            key: 'wallet',
            label: 'Wallet Balance',
            desc: 'Available: ₹250.00'
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
              {currentStep < steps.length - 1 ? <Button type="primary" onClick={() => setCurrentStep(c => c + 1)}>Next</Button> : <Button type="primary" size="large" onClick={handlePlaceOrder} loading={submitting} style={{
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
            <div className="d-flex justify-content-between mb-1"><Text>Tax</Text><Text>₹{tax}</Text></div>
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
    </div>;
};
export default Checkout;