import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Input, Select, Space, Row, Col, Statistic, Avatar, Modal, Descriptions } from 'antd';
import { SearchOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { getCustomers } from '../../services/api';

const { Title, Text } = Typography;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, [statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await getCustomers(params);
      setCustomers(res.data || []);
    } catch { /* API not available */ }
    finally { setLoading(false); }
  };

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c: any) => c.is_active).length;
  const totalRevenue = customers.reduce((s: number, c: any) => s + Number(c.total_spent || 0), 0);

  const columns = [
    {
      title: 'Customer', dataIndex: 'customer_name',
      render: (name: string) => (
        <div className="d-flex align-items-center gap-3">
          <Avatar style={{ background: '#1890ff' }} icon={<UserOutlined />} />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'mobile' },
    { title: 'Orders', dataIndex: 'order_count', sorter: (a: any, b: any) => a.order_count - b.order_count },
    { title: 'Spent', dataIndex: 'total_spent', render: (v: number) => <Text strong>₹{Number(v || 0).toLocaleString()}</Text>, sorter: (a: any, b: any) => a.total_spent - b.total_spent },
    { title: 'Wallet', dataIndex: 'wallet_balance', render: (v: number) => v > 0 ? <Tag color="green">₹{v}</Tag> : <Text type="secondary">₹0</Text> },
    { title: 'Loyalty', dataIndex: 'loyalty_points', render: (v: number) => <Tag color="purple">{v || 0}</Tag> },
    { title: 'Status', dataIndex: 'is_active', render: (v: any) => <Tag color={v ? 'green' : 'default'}>{v ? 'active' : 'inactive'}</Tag> },
    {
      title: 'Actions',
      render: (_: unknown, r: any) => <Button type="link" icon={<EyeOutlined />} onClick={() => setDetail(r)}>View</Button>,
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-4">
        {[
          { title: 'Total Customers', value: totalCustomers, color: '#1890ff' },
          { title: 'Active', value: activeCustomers, color: '#52c41a' },
          { title: 'Total Revenue', value: totalRevenue, prefix: '₹', color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} md={8} key={i}>
            <Card style={{ borderRadius: 12, borderTop: `3px solid ${s.color}` }} bodyStyle={{ padding: '16px 20px' }}>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} valueStyle={{ color: s.color, fontSize: '1.5rem' }} />
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Customers</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." style={{ width: 250 }} value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }} options={[{ value: '', label: 'All' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={customers.map((c: any) => ({ ...c, key: c.customer_id }))} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="Customer Details" open={!!detail} onCancel={() => setDetail(null)} footer={null} width={550}>
        {detail && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Name">{detail.customer_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{detail.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{detail.mobile}</Descriptions.Item>
            <Descriptions.Item label="Orders">{detail.order_count}</Descriptions.Item>
            <Descriptions.Item label="Total Spent">₹{Number(detail.total_spent || 0).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Wallet">₹{detail.wallet_balance || 0}</Descriptions.Item>
            <Descriptions.Item label="Loyalty Points">{detail.loyalty_points || 0}</Descriptions.Item>
            <Descriptions.Item label="Joined">{new Date(detail.created_at).toLocaleDateString()}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminCustomers;
