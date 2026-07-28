import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Select, Input, Space, Modal, Steps, Divider, message, Spin } from 'antd';
import { EyeOutlined, SearchOutlined, PrinterOutlined } from '@ant-design/icons';
import { getOrders, getOrderById, updateOrderStatus } from '../../services/api';
const {
  Title,
  Text
} = Typography;

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const res = await getOrders(params);
      setOrders(res.data || []);
    } catch {/* API not available */} finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record) => {
    setDetailLoading(true);
    setDetailOrder(record);
    try {
      const res = await getOrderById(record.order_id);
      if (res.data) {
        setDetailOrder(res.data);
      }
    } catch {
      message.error('Failed to load order details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      message.success('Status updated');
      fetchData();
      setDetailOrder(null);
    } catch {
      message.error('Failed to update status');
    }
  };

  const statusColors = {
    'Placed': 'blue',
    'Accepted': 'geekblue',
    'Packed': 'orange',
    'Out for Delivery': 'cyan',
    'Delivered': 'green',
    'Cancelled': 'red'
  };

  const statusStepMap = {
    'Placed': 0,
    'Accepted': 1,
    'Packed': 2,
    'Out for Delivery': 3,
    'Delivered': 4
  };

  const columns = [{
    title: 'Order #',
    dataIndex: 'order_number',
    render: v => <Text strong style={{
      color: '#1890ff'
    }}>{v}</Text>
  }, {
    title: 'Date',
    dataIndex: 'created_at',
    render: v => new Date(v).toLocaleDateString()
  }, {
    title: 'Customer',
    dataIndex: 'customer_name'
  }, {
    title: 'Total',
    dataIndex: 'grand_total',
    render: v => `₹${v}`
  }, {
    title: 'Payment',
    dataIndex: 'payment_method',
    render: v => <Tag>{v || 'N/A'}</Tag>
  }, {
    title: 'Status',
    dataIndex: 'order_status',
    render: s => <Tag color={statusColors[s] || 'blue'}>{s}</Tag>
  }, {
    title: 'Actions',
    render: (_, r) => <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)} />
          <Button type="link" icon={<PrinterOutlined />} />
        </Space>
  }];

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 70,
    },
    {
      title: 'Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: v => `₹${v}`,
      width: 90,
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v, r) => `₹${v || (r.qty * r.unit_price)}`,
      width: 100,
    }
  ];

  const fullAddress = [
    detailOrder?.address_line1,
    detailOrder?.address_line2,
    detailOrder?.city,
    detailOrder?.state,
    detailOrder?.pincode
  ].filter(Boolean).join(', ');

  return <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Order Management</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search orders..." style={{ width: 220 }} value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{
          value: 'all',
          label: 'All Status'
        }, {
          value: 'Placed',
          label: 'Placed'
        }, {
          value: 'Packed',
          label: 'Packed'
        }, {
          value: 'Out for Delivery',
          label: 'Out for Delivery'
        }, {
          value: 'Delivered',
          label: 'Delivered'
        }, {
          value: 'Cancelled',
          label: 'Cancelled'
        }]} />
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={orders.map((o, i) => ({
        ...o,
        key: i
      }))} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title={`Order — ${detailOrder?.order_number}`} open={!!detailOrder} onCancel={() => setDetailOrder(null)} footer={null} width={680}>
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}><Spin size="large" /></div>
        ) : detailOrder && <div>
            <div className="d-flex justify-content-between mb-2">
              <div><Text strong>Customer:</Text> {detailOrder.customer_name || 'N/A'} {detailOrder.mobile ? `(${detailOrder.mobile})` : ''}</div>
              <Tag color={statusColors[detailOrder.order_status] || 'blue'}>{detailOrder.order_status}</Tag>
            </div>
            {fullAddress && (
              <div className="mb-3">
                <Text strong>Delivery Address:</Text> <Text type="secondary">{fullAddress}</Text>
              </div>
            )}
            <Steps current={statusStepMap[detailOrder.order_status] ?? 0} size="small" items={[{
          title: 'Placed'
        }, {
          title: 'Accepted'
        }, {
          title: 'Packed'
        }, {
          title: 'Out for Delivery'
        }, {
          title: 'Delivered'
        }]} />
            <Divider style={{ margin: '16px 0' }} />

            <Title level={5} style={{ marginBottom: 8 }}>Order Items</Title>
            <Table
              columns={itemColumns}
              dataSource={(detailOrder.items || []).map((item, idx) => ({ ...item, key: idx }))}
              pagination={false}
              size="small"
              bordered
            />

            <Divider style={{ margin: '16px 0' }} />
            <div className="d-flex justify-content-between mb-2"><Text>Subtotal</Text><Text>₹{detailOrder.subtotal || detailOrder.grand_total}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Delivery Charge</Text><Text>₹{detailOrder.delivery_charge || 0}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Payment Method</Text><Tag>{detailOrder.payment_method || 'COD'}</Tag></div>
            <div className="d-flex justify-content-between mb-2"><Text strong style={{ fontSize: 16 }}>Grand Total</Text><Text strong style={{ fontSize: 16, color: '#52c41a' }}>₹{detailOrder.grand_total}</Text></div>
            <Divider style={{ margin: '16px 0' }} />
            <Space className="w-100" style={{ justifyContent: 'flex-end' }}>
              <Select value={detailOrder.order_status} style={{ width: 180 }} options={Object.keys(statusColors).map(s => ({
            value: s,
            label: s
          }))} onChange={v => handleStatusUpdate(detailOrder.order_id, v)} />
              <Button icon={<PrinterOutlined />}>Print</Button>
            </Space>
          </div>}
      </Modal>
    </div>;
};
export default AdminOrders;