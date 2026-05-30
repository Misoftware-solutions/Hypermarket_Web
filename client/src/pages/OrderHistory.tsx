import { Table, Tag, Button, Typography, Card, Input, Select, Space, Tabs } from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const OrderHistory = () => {
  const orders = [
    { key: 1, order_id: 'ORD-1001', date: '2026-05-14', items: 3, total: 440, status: 'Delivered' },
    { key: 2, order_id: 'ORD-1002', date: '2026-05-13', items: 5, total: 1240, status: 'Out for Delivery' },
    { key: 3, order_id: 'ORD-1003', date: '2026-05-12', items: 2, total: 890, status: 'Packed' },
    { key: 4, order_id: 'ORD-1004', date: '2026-05-10', items: 4, total: 320, status: 'Delivered' },
    { key: 5, order_id: 'ORD-1005', date: '2026-05-08', items: 1, total: 1560, status: 'Cancelled' },
    { key: 6, order_id: 'ORD-1006', date: '2026-05-15', items: 3, total: 440, status: 'Placed' },
  ];

  const statusColors: Record<string, string> = {
    'Placed': 'blue', 'Accepted': 'geekblue', 'Packed': 'orange', 'Out for Delivery': 'cyan', 'Delivered': 'green', 'Cancelled': 'red',
  };

  const columns = [
    { title: 'Order #', dataIndex: 'order_id', render: (v: string) => <Link to={`/order/${v}`}><Text strong style={{ color: '#1890ff' }}>{v}</Text></Link> },
    { title: 'Date', dataIndex: 'date' },
    { title: 'Items', dataIndex: 'items' },
    { title: 'Total', dataIndex: 'total', render: (v: number) => <Text strong>₹{v}</Text> },
    { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
    {
      title: 'Actions',
      render: (_: unknown, record: typeof orders[0]) => (
        <Space>
          <Link to={`/order/${record.order_id}`}><Button type="link" icon={<EyeOutlined />}>View</Button></Link>
          {record.status === 'Delivered' && <Button type="link" icon={<ReloadOutlined />}>Reorder</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px 50px' }}>
      <Title level={2}>My Orders</Title>

      <Card style={{ borderRadius: 12 }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Tabs defaultActiveKey="all" items={[
            { key: 'all', label: `All (${orders.length})` },
            { key: 'active', label: 'Active' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'cancelled', label: 'Cancelled' },
          ]} />
          <Space>
            <Input prefix={<SearchOutlined />} placeholder="Search by order #" style={{ width: 220 }} />
            <Select defaultValue="all" style={{ width: 140 }} options={[
              { value: 'all', label: 'All Status' },
              { value: 'placed', label: 'Placed' },
              { value: 'delivered', label: 'Delivered' },
            ]} />
          </Space>
        </div>
        <Table columns={columns} dataSource={orders} pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default OrderHistory;
