import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography, Spin } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserOutlined, ShopOutlined } from '@ant-design/icons';
import { getDashboardStats } from '../../services/api';

const { Title } = Typography;

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getDashboardStats();
      setData(res.data);
    } catch { setData(null); }
    finally { setLoading(false); }
  };

  const statusColors: Record<string, string> = {
    'Placed': 'blue', 'Accepted': 'geekblue', 'Packed': 'orange', 'Out for Delivery': 'cyan', 'Delivered': 'green', 'Cancelled': 'red'
  };

  if (loading) return <div className="text-center py-5"><Spin size="large" /></div>;

  const stats = [
    { title: 'Total Sales', value: data?.totalSales || 0, prefix: '₹', icon: <DollarOutlined />, color: '#1890ff' },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: <ShoppingCartOutlined />, color: '#52c41a' },
    { title: 'Total Customers', value: data?.totalCustomers || 0, icon: <UserOutlined />, color: '#722ed1' },
    { title: 'Total Products', value: data?.totalProducts || 0, icon: <ShopOutlined />, color: '#fa8c16' },
  ];

  return (
    <div>
      <Title level={3}>Dashboard</Title>
      <Row gutter={[16, 16]} className="mb-4">
        {stats.map((stat, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card style={{ borderRadius: 12, borderLeft: `4px solid ${stat.color}` }}>
              <Statistic title={stat.title} value={stat.value} prefix={stat.prefix} valueStyle={{ color: stat.color }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={14}>
          <Card title="Recent Orders" style={{ borderRadius: 12 }}>
            <Table dataSource={(data?.recentOrders || []).map((o: any, i: number) => ({ ...o, key: i }))} pagination={false} size="small" columns={[
              { title: 'Order #', dataIndex: 'order_number', render: (v: string) => <a>{v}</a> },
              { title: 'Customer', dataIndex: 'customer_name' },
              { title: 'Total', dataIndex: 'grand_total', render: (v: number) => `₹${v}` },
              { title: 'Status', dataIndex: 'order_status', render: (s: string) => <Tag color={statusColors[s]}>{s}</Tag> },
              { title: 'Date', dataIndex: 'created_at', render: (v: string) => new Date(v).toLocaleDateString() },
            ]} />
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Low Stock Alerts" style={{ borderRadius: 12 }} extra={<Tag color="red">{(data?.lowStockProducts || []).length} items</Tag>}>
            <Table dataSource={(data?.lowStockProducts || []).map((p: any, i: number) => ({ ...p, key: i }))} pagination={false} size="small" columns={[
              { title: 'Product', dataIndex: 'product_name' },
              { title: 'Stock', dataIndex: 'stock_qty', render: (v: number) => <Tag color="red">{v}</Tag> },
              { title: 'Threshold', dataIndex: 'low_stock_threshold' },
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
