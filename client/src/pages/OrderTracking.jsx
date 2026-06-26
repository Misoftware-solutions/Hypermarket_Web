import { useState, useEffect } from 'react';
import { Steps, Card, Typography, Row, Col, Tag, Button, Divider, Space, Spin, message } from 'antd';
import { PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../services/api';

const {
  Title,
  Text
} = Typography;

const OrderTracking = () => {
  const {
    orderId
  } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        message.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-5" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  if (!order) {
    return <div className="text-center py-5"><Title level={4}>Order not found</Title></div>;
  }

  const statusSteps = {
    'Placed': 0,
    'Accepted': 1,
    'Packed': 2,
    'Out for Delivery': 3,
    'Delivered': 4,
    'Cancelled': -1
  };

  const currentStep = statusSteps[order.order_status] !== undefined ? statusSteps[order.order_status] : 0;

  const trackingSteps = [
    { title: 'Placed', description: 'Order received' },
    { title: 'Accepted', description: 'Confirmed by store' },
    { title: 'Packed', description: 'Ready for pick up' },
    { title: 'Out for Delivery', description: 'Courier on the way' },
    { title: 'Delivered', description: 'Package handed over' }
  ];

  return <div style={{
    padding: '20px 50px'
  }}>
      <Link to="/orders"><Button type="link" className="mb-2">← Back to Orders</Button></Link>
      <Title level={2}>Order {order.order_number}</Title>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          {/* Status Tracker */}
          <Card style={{
          borderRadius: 12,
          marginBottom: 16
        }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Title level={4} style={{
                margin: 0
              }}>Order Status</Title>
                <Text type="secondary">Placed on {new Date(order.created_at).toLocaleString()}</Text>
              </div>
              <Tag color={order.order_status === 'Cancelled' ? 'red' : 'cyan'} style={{
              fontSize: '1rem',
              padding: '4px 16px'
            }}>{order.order_status}</Tag>
            </div>
            {order.order_status === 'Cancelled' ? (
              <div className="p-3 mb-3 bg-light text-danger rounded">This order was cancelled.</div>
            ) : (
              <Steps current={currentStep} items={trackingSteps} />
            )}
          </Card>

          {/* Map placeholder */}
          <Card style={{
          borderRadius: 12,
          marginBottom: 16
        }}>
            <Title level={5}>Live Tracking</Title>
            <div style={{
            height: 250,
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
              <div className="text-center">
                <EnvironmentOutlined style={{
                fontSize: 48,
                color: '#4f46e5'
              }} />
                <br />
                <Text type="secondary">Map tracking will appear here</Text>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 p-3" style={{
            background: '#f8f9fa',
            borderRadius: 8
          }}>
              <div>
                <Text strong>Estimated Delivery Slot</Text>
                <br />
                <Text type="secondary" style={{
                fontSize: '1.1rem'
              }}>{order.delivery_slot || 'Express Delivery'}</Text>
              </div>
              <Tag color="blue" style={{
              fontSize: '0.9rem',
              padding: '4px 12px'
            }}>{order.order_status === 'Delivered' ? 'Completed' : 'On Time'}</Tag>
            </div>
          </Card>

          {/* Items */}
          <Card title="Items in this order" style={{
          borderRadius: 12
        }}>
            {(order.items || []).map((item, i) => <div key={i} className="d-flex justify-content-between align-items-center py-2" style={{
            borderBottom: i < order.items.length - 1 ? '1px solid #f0f0f0' : 'none'
          }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{
                width: 50,
                height: 50,
                background: '#f0f0f0',
                borderRadius: 8
              }} />
                  <div>
                    <Text strong>{item.product_name}</Text>
                    {item.size && <div style={{ fontSize: '0.8rem', color: '#8c8c8c', marginTop: 2 }}>Size: {item.size}</div>}
                    <br />
                    <Text type="secondary">Qty: {Number(item.qty)} x ₹{Number(item.unit_price)}</Text>
                  </div>
                </div>
                <Text strong>₹{Number(item.qty) * Number(item.unit_price)}</Text>
              </div>)}
            <Divider />
            <div className="d-flex justify-content-between">
              <Title level={4} style={{
              margin: 0
            }}>Total</Title>
              <Title level={4} style={{
              margin: 0,
              color: '#1890ff'
            }}>₹{Number(order.grand_total)}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Delivery Partner */}
          <Card title="Delivery Partner" style={{
          borderRadius: 12,
          marginBottom: 16
        }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
                D
              </div>
              <div>
                <Text strong>Delivery Executive</Text>
                <br />
                <Text type="secondary">+91 98765 43210</Text>
              </div>
            </div>
            <Button type="primary" icon={<PhoneOutlined />} block className="mt-3" shape="round">Call Partner</Button>
          </Card>

          {/* Payment Information */}
          <Card title="Payment Information" style={{
          borderRadius: 12,
          marginBottom: 16
        }}>
            <Text className="d-block"><strong>Method:</strong> {order.payment_method?.toUpperCase() || 'COD'}</Text>
            <Text className="d-block mt-1"><strong>Status:</strong> <Tag color={order.payment_status === 'Paid' ? 'green' : 'orange'}>{order.payment_status}</Tag></Text>
          </Card>

          {/* Actions */}
          <Space direction="vertical" className="w-100">
            <Button block shape="round">Contact Support</Button>
          </Space>
        </Col>
      </Row>
    </div>;
};
export default OrderTracking;