import { useState, useEffect } from 'react';
import { Steps, Card, Typography, Row, Col, Tag, Button, Divider, Space, Spin, Modal, message } from 'antd';
import { PhoneOutlined, EnvironmentOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getOrderById, getSettings } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    store_name: 'Hypermarket',
    email: 'support@hypermarket.com',
    phone: '+91 98765 43210',
    address: '123, MG Road, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    default_tax: '5',
    show_tax_breakup: 'true'
  });

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

    getSettings().then(res => {
      if (res.data) setStoreSettings(res.data);
    }).catch(() => {});
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

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area').innerHTML;
    const printWindow = window.open('about:blank', 'PrintReceipt', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>E-Receipt - ${order.order_number}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #333; line-height: 1.5; }
            .receipt-header { text-align: center; margin-bottom: 25px; border-bottom: 2px dashed #ddd; padding-bottom: 15px; }
            .receipt-title { font-size: 26px; font-weight: bold; margin-bottom: 5px; color: #1890ff; }
            .store-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; color: #555; }
            .meta-col { display: flex; flex-direction: column; }
            .address-box { margin-bottom: 25px; font-size: 14px; background-color: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
            th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; font-size: 14px; }
            th { background-color: #fcfcfc; font-weight: 600; color: #555; }
            .summary { margin-left: auto; width: 320px; font-size: 14px; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .total-row { font-size: 18px; font-weight: bold; border-top: 2px double #333; padding-top: 10px; margin-top: 8px; color: #1890ff; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; border-top: 1px dashed #ccc; padding-top: 20px; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // E-Receipt Calculations
  const calculatedTaxRate = Number(storeSettings.default_tax || 5) / 100;
  const itemsSubtotal = (order.items || []).reduce((sum, item) => sum + (Number(item.qty) * Number(item.unit_price)), 0);
  const calculatedTax = Math.round(itemsSubtotal * calculatedTaxRate);
  
  return (
    <div style={{ padding: '20px 50px' }}>
      <Link to="/orders"><Button type="link" className="mb-2">← Back to Orders</Button></Link>
      <Title level={2}>Order {order.order_number}</Title>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          {/* Status Tracker */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <Title level={4} style={{ margin: 0 }}>Order Status</Title>
                <Text type="secondary">Placed on {new Date(order.created_at).toLocaleString()}</Text>
              </div>
              <Tag color={order.order_status === 'Cancelled' ? 'red' : 'cyan'} style={{ fontSize: '1rem', padding: '4px 16px' }}>{order.order_status}</Tag>
            </div>
            {order.order_status === 'Cancelled' ? (
              <div className="p-3 mb-3 bg-light text-danger rounded">This order was cancelled.</div>
            ) : (
              <Steps current={currentStep} items={trackingSteps} />
            )}
          </Card>

          {/* Map placeholder */}
          <Card style={{ borderRadius: 12, marginBottom: 16 }}>
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
                <EnvironmentOutlined style={{ fontSize: 48, color: '#4f46e5' }} />
                <br />
                <Text type="secondary">Map tracking will appear here</Text>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3 p-3" style={{ background: '#f8f9fa', borderRadius: 8 }}>
              <div>
                <Text strong>Estimated Delivery Slot</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '1.1rem' }}>{order.delivery_slot || 'Express Delivery'}</Text>
              </div>
              <Tag color="blue" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>{order.order_status === 'Delivered' ? 'Completed' : 'On Time'}</Tag>
            </div>
          </Card>

          {/* Items */}
          <Card title="Items in this order" style={{ borderRadius: 12 }}>
            {(order.items || []).map((item, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center py-2" style={{ borderBottom: i < order.items.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div className="d-flex align-items-center gap-3">
                  <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    📦
                  </div>
                  <div>
                    <Text strong>{item.product_name}</Text>
                    {item.size && <div style={{ fontSize: '0.8rem', color: '#8c8c8c', marginTop: 2 }}>Size: {item.size}</div>}
                    <br />
                    <Text type="secondary">Qty: {Number(item.qty)} x ₹{Number(item.unit_price)}</Text>
                  </div>
                </div>
                <Text strong>₹{Number(item.qty) * Number(item.unit_price)}</Text>
              </div>
            ))}
            <Divider />
            <div className="d-flex justify-content-between">
              <Title level={4} style={{ margin: 0 }}>Total</Title>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>₹{Number(order.grand_total)}</Title>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Delivery Partner */}
          <Card title="Delivery Partner" style={{ borderRadius: 12, marginBottom: 16 }}>
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
          <Card title="Payment Information" style={{ borderRadius: 12, marginBottom: 16 }}>
            <Text className="d-block"><strong>Method:</strong> {order.payment_method?.toUpperCase() || 'COD'}</Text>
            <Text className="d-block mt-1"><strong>Status:</strong> <Tag color={order.payment_status === 'Paid' ? 'green' : 'orange'}>{order.payment_status}</Tag></Text>
          </Card>

          {/* Actions */}
          <Space direction="vertical" className="w-100">
            {order.order_status === 'Delivered' && (
              <Button type="primary" block shape="round" icon={<FileTextOutlined />} onClick={() => setReceiptOpen(true)}>
                View E-Receipt
              </Button>
            )}
            <Button block shape="round">Contact Support</Button>
          </Space>
        </Col>
      </Row>

      {/* E-Receipt Modal */}
      <Modal
        title={<span><FileTextOutlined className="me-2 text-primary" /> Order E-Receipt</span>}
        open={receiptOpen}
        onCancel={() => setReceiptOpen(false)}
        footer={[
          <Button key="close" onClick={() => setReceiptOpen(false)}>Close</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>Print Receipt</Button>
        ]}
        width={650}
        bodyStyle={{ padding: '20px' }}
      >
        <div id="receipt-print-area">
          <div className="receipt-header">
            <div className="receipt-title">E-RECEIPT</div>
            <div className="store-name">{storeSettings.store_name}</div>
            <div style={{ fontSize: '13px', color: '#555' }}>
              {storeSettings.address}, {storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}<br />
              Phone: {storeSettings.phone} | Email: {storeSettings.email}
            </div>
          </div>

          <div className="meta-info">
            <div className="meta-col">
              <strong>Order Details:</strong>
              <span>Order No: {order.order_number}</span>
              <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
              <span>Payment: {order.payment_method?.toUpperCase() || 'COD'} ({order.payment_status})</span>
            </div>
            <div className="meta-col" style={{ textAlign: 'right' }}>
              <strong>Customer Address:</strong>
              <span>{order.customer_name}</span>
              <span>{order.phone_number}</span>
              <span style={{ maxWidth: '250px', wordBreak: 'break-word' }}>{order.delivery_address}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.product_name}
                    {item.size && <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Size: {item.size}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>₹{Number(item.unit_price)}</td>
                  <td style={{ textAlign: 'center' }}>{Number(item.qty)}</td>
                  <td style={{ textAlign: 'right' }}>₹{Number(item.qty) * Number(item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{itemsSubtotal}</span>
            </div>
            
            {storeSettings.show_tax_breakup === 'true' && (
              <div className="summary-row">
                <span>Tax ({storeSettings.default_tax}%)</span>
                <span>₹{calculatedTax}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery Charge</span>
              <span>₹{Number(order.grand_total) - itemsSubtotal - (storeSettings.show_tax_breakup === 'true' ? calculatedTax : 0)}</span>
            </div>

            <div className="summary-row total-row">
              <span>Grand Total</span>
              <span>₹{Number(order.grand_total)}</span>
            </div>
          </div>

          <div className="footer">
            Thank you for shopping with {storeSettings.store_name}!<br />
            This is a computer generated digital E-Receipt. No physical signature is required.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderTracking;