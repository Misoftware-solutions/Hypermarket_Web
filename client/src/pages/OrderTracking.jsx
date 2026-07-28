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
    const printWindow = window.open('', '_blank', 'width=850,height=900');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>E-Receipt_${order.order_number}</title>
          <style>
            @media print {
              @page { margin: 10mm; size: auto; }
              body { margin: 0; background: #fff !important; }
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
              padding: 24px; 
              color: #262626; 
              background: #fff;
              max-width: 700px;
              margin: 0 auto;
            }
            .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 20px; }
            .store-name { font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .store-info { font-size: 12px; color: #595959; line-height: 1.4; }
            .receipt-badge { display: inline-block; background: #000; color: #fff; padding: 4px 12px; font-weight: 700; font-size: 12px; border-radius: 4px; margin-top: 8px; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; border-bottom: 1px dashed #ccc; padding-bottom: 16px; }
            .meta-box strong { display: block; font-size: 11px; text-transform: uppercase; color: #8c8c8c; margin-bottom: 4px; letter-spacing: 0.5px; }
            .meta-box div { color: #1f1f1f; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th { text-align: left; padding: 8px; border-bottom: 2px solid #262626; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #595959; }
            td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; }
            .summary-table { width: 280px; margin-left: auto; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .total-row { font-size: 16px; font-weight: 800; border-top: 2px solid #000; border-bottom: 2px double #000; padding: 10px 0; margin-top: 6px; }
            .receipt-footer { text-align: center; margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 16px; font-size: 12px; color: #595959; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                window.close();
              }, 400);
            };
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
        <div id="receipt-print-area" style={{ background: '#fff', padding: '10px' }}>
          {/* Header */}
          <div className="receipt-header">
            <div className="store-name">{storeSettings.store_name}</div>
            <div className="store-info">
              {storeSettings.address}, {storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}<br />
              Tel: {storeSettings.phone} | Email: {storeSettings.email}
            </div>
            <div className="receipt-badge">TAX INVOICE / DIGITAL RECEIPT</div>
          </div>

          {/* Metadata Grid */}
          <div className="meta-grid">
            <div className="meta-box">
              <strong>Order Details</strong>
              <div>Order No: <span style={{ fontWeight: 700 }}>{order.order_number}</span></div>
              <div>Date: {new Date(order.created_at).toLocaleString()}</div>
              <div>Payment: {order.payment_method?.toUpperCase() || 'COD'} ({order.payment_status})</div>
            </div>
            <div className="meta-box" style={{ textAlign: 'right' }}>
              <strong>Customer & Shipping</strong>
              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
              <div>Phone: {order.phone_number}</div>
              <div style={{ fontSize: '12px', color: '#595959' }}>{order.delivery_address}</div>
            </div>
          </div>

          {/* Items Table */}
          <table>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Item Description</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'center' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong style={{ color: '#262626' }}>{item.product_name}</strong>
                    {item.size && <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{item.size}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>₹{Number(item.unit_price)}</td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{Number(item.qty)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{Number(item.qty) * Number(item.unit_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Calculation */}
          <div className="summary-table">
            <div className="summary-row">
              <span>Items Subtotal:</span>
              <span>₹{itemsSubtotal}</span>
            </div>
            
            {storeSettings.show_tax_breakup === 'true' && (
              <div className="summary-row">
                <span>Tax ({storeSettings.default_tax}% GST):</span>
                <span>₹{calculatedTax}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Delivery Charge:</span>
              <span>₹{Math.max(0, Number(order.grand_total) - itemsSubtotal - (storeSettings.show_tax_breakup === 'true' ? calculatedTax : 0))}</span>
            </div>

            <div className="summary-row total-row">
              <span>GRAND TOTAL:</span>
              <span>₹{Number(order.grand_total)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <div>Thank you for shopping with <strong>{storeSettings.store_name}</strong>!</div>
            <div style={{ fontSize: '11px', marginTop: '4px', color: '#8c8c8c' }}>
              This is an official computer-generated receipt. GST invoice terms apply.
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderTracking;