import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Input, Select, Space, Tabs, Spin, Empty, message } from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getCustomerOrders } from '../services/api';

const {
  Title,
  Text
} = Typography;

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (!user) {
      message.error('Please login to view your orders');
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await getCustomerOrders(user.id);
        const mapped = (res.data || []).map(order => ({
          key: order.order_id,
          order_id: order.order_number,
          date: new Date(order.created_at).toISOString().split('T')[0],
          items: order.item_count,
          total: Number(order.grand_total),
          status: order.order_status
        }));
        setOrders(mapped);
      } catch (err) {
        message.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusColors = {
    'Placed': 'blue',
    'Accepted': 'geekblue',
    'Packed': 'orange',
    'Out for Delivery': 'cyan',
    'Delivered': 'green',
    'Cancelled': 'red'
  };

  const columns = [{
    title: 'Order #',
    dataIndex: 'order_id',
    render: v => <Link to={`/order/${v}`}><Text strong style={{
        color: '#1890ff'
      }}>{v}</Text></Link>
  }, {
    title: 'Date',
    dataIndex: 'date'
  }, {
    title: 'Items',
    dataIndex: 'items'
  }, {
    title: 'Total',
    dataIndex: 'total',
    render: v => <Text strong>₹{v}</Text>
  }, {
    title: 'Status',
    dataIndex: 'status',
    render: s => <Tag color={statusColors[s] || 'default'}>{s}</Tag>
  }, {
    title: 'Actions',
    render: (_, record) => <Space>
          <Link to={`/order/${record.order_id}`}><Button type="link" icon={<EyeOutlined />}>View</Button></Link>
          {record.status === 'Delivered' && <Button type="link" icon={<ReloadOutlined />}>Reorder</Button>}
        </Space>
  }];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_id.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-5" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  return <div style={{
    padding: '20px 50px'
  }}>
      <Title level={2}>My Orders</Title>

      <Card style={{
      borderRadius: 12
    }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Tabs activeKey={statusFilter} onChange={setStatusFilter} items={[{
          key: 'all',
          label: `All (${orders.length})`
        }, {
          key: 'placed',
          label: 'Placed'
        }, {
          key: 'delivered',
          label: 'Delivered'
        }, {
          key: 'cancelled',
          label: 'Cancelled'
        }]} />
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="Search by order #" value={searchText} onChange={e => setSearchText(e.target.value)} style={{
            width: 220
          }} />
            <Select value={statusFilter} onChange={setStatusFilter} style={{
            width: 140
          }} options={[{
            value: 'all',
            label: 'All Status'
          }, {
            value: 'placed',
            label: 'Placed'
          }, {
            value: 'delivered',
            label: 'Delivered'
          }, {
            value: 'cancelled',
            label: 'Cancelled'
          }]} />
          </Space>
        </div>
        <Table columns={columns} dataSource={filteredOrders} pagination={{
        pageSize: 10
      }} />
      </Card>
    </div>;
};
export default OrderHistory;