import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Select, Input, Space, Modal, Steps, Divider, message } from 'antd';
import { EyeOutlined, SearchOutlined, PrinterOutlined } from '@ant-design/icons';
import { getOrders, updateOrderStatus } from '../../services/api';
const {
  Title,
  Text
} = Typography;
const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailOrder, setDetailOrder] = useState(null);
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
    render: s => <Tag color={statusColors[s]}>{s}</Tag>
  }, {
    title: 'Actions',
    render: (_, r) => <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => setDetailOrder(r)} />
          <Button type="link" icon={<PrinterOutlined />} />
        </Space>
  }];
  return <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{
        margin: 0
      }}>Order Management</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search orders..." style={{
          width: 220
        }} value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{
          width: 150
        }} options={[{
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
      <Card style={{
      borderRadius: 12
    }} bodyStyle={{
      padding: 0
    }}>
        <Table columns={columns} dataSource={orders.map((o, i) => ({
        ...o,
        key: i
      }))} loading={loading} pagination={{
        pageSize: 10
      }} />
      </Card>
      <Modal title={`Order — ${detailOrder?.order_number}`} open={!!detailOrder} onCancel={() => setDetailOrder(null)} footer={null} width={600}>
        {detailOrder && <div>
            <div className="d-flex justify-content-between mb-3">
              <div><Text strong>Customer:</Text> {detailOrder.customer_name}</div>
              <Tag color={statusColors[detailOrder.order_status]}>{detailOrder.order_status}</Tag>
            </div>
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
            <Divider />
            <div className="d-flex justify-content-between mb-2"><Text>Payment</Text><Tag>{detailOrder.payment_method || 'N/A'}</Tag></div>
            <div className="d-flex justify-content-between mb-2"><Text>Total</Text><Text strong>₹{detailOrder.grand_total}</Text></div>
            <Divider />
            <Space className="w-100" style={{
          justifyContent: 'flex-end'
        }}>
              <Select defaultValue={detailOrder.order_status} style={{
            width: 180
          }} options={Object.keys(statusColors).map(s => ({
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