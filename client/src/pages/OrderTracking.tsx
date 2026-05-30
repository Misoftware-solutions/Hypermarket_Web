import { Steps, Card, Typography, Row, Col, Tag, Button, Divider, Space } from 'antd';
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const OrderTracking = () => {
  const { orderId } = useParams();

  const order = {
    order_id: orderId || 'ORD-1006',
    date: '2026-05-15',
    status: 'Out for Delivery',
    currentStep: 3,
    estimatedDelivery: '12:30 PM - 1:00 PM',
    deliveryPartner: { name: 'Rajesh Kumar', phone: '+91 98765 43210' },
    address: '123, MG Road, Koramangala, Bangalore - 560034',
    items: [
      { name: 'Fresh Organic Apples', qty: 2, price: 120 },
      { name: 'Organic Milk 1L', qty: 1, price: 65 },
      { name: 'Whole Wheat Bread', qty: 3, price: 45 },
    ],
    total: 440,
  };

  const statusSteps = [
    { title: 'Placed', description: 'May 15, 9:00 AM' },
    { title: 'Accepted', description: 'May 15, 9:05 AM' },
    { title: 'Packed', description: 'May 15, 10:30 AM' },
    { title: 'Out for Delivery', description: 'May 15, 11:15 AM' },
    { title: 'Delivered', description: 'Estimated: 12:30 PM' },
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <Link to="/orders"><Button type="link" className="mb-2">← Back to Orders</Button></Link>
      <Title level={2}>Order {order.order_id}</Title>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          {/* Status Tracker */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Title level={4} style={{ margin: 0 }}>Order Status</Title>
                <Text type="secondary">Placed on {order.date}</Text>
              </div>
              <Tag color="cyan" style={{ fontSize: '1rem', padding: '4px 16px' }}>{order.status}</Tag>
            </div>
            <Steps current={order.currentStep} items={statusSteps} />
          </Card>

          {/* Map placeholder */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <Title level={5}>Live Tracking</Title>
            <div style={{ height: 250, background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center">
                <EnvironmentOutlined style={{ fontSize: 48, color: '#4f46e5' }} />
                <br />
                <Text type="secondary">Map tracking will appear here</Text>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 p-3" style={{ background: '#f8f9fa', borderRadius: 8 }}>
              <div>
                <Text strong>Estimated Delivery</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '1.1rem' }}>{order.estimatedDelivery}</Text>
              </div>
              <Tag color="blue" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>On Time</Tag>
            </div>
          </Card>

          {/* Items */}
          <Card title="Items in this order" style={{ borderRadius: 12 }}>
            {order.items.map((item, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: i < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 8 }} />
                  <div>
                    <Text strong>{item.name}</Text>
                    <br />
                    <Text type="secondary">Qty: {item.qty}</Text>
                  </div>
                </div>
                <Text strong>₹{item.price * item.qty}</Text>
              </div>
            ))}
            <Divider />
            <div className="d-flex justify-content-between">
              <Title level={4} style={{ margin: 0 }}>Total</Title>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>₹{order.total}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Delivery Partner */}
          <Card title="Delivery Partner" style={{ borderRadius: 12, marginBottom: 16 }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                {order.deliveryPartner.name[0]}
              </div>
              <div>
                <Text strong>{order.deliveryPartner.name}</Text>
                <br />
                <Text type="secondary">{order.deliveryPartner.phone}</Text>
              </div>
            </div>
            <Button type="primary" icon={<PhoneOutlined />} block className="mt-3" shape="round">Call Partner</Button>
          </Card>

          {/* Delivery Address */}
          <Card title="Delivery Address" style={{ borderRadius: 12, marginBottom: 16 }}>
            <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            <Text>{order.address}</Text>
          </Card>

          {/* Actions */}
          <Space direction="vertical" className="w-100">
            <Button danger block shape="round">Cancel Order</Button>
            <Button block shape="round">Contact Support</Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default OrderTracking;
