import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Input, Select, Space, Row, Col, Statistic, Badge, InputNumber, Modal, message } from 'antd';
import { SearchOutlined, WarningOutlined, SyncOutlined } from '@ant-design/icons';
import { getInventory, updateStock } from '../../services/api';

const { Title, Text } = Typography;

const AdminInventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, totalUnits: 0, lowStock: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updateModal, setUpdateModal] = useState<{ open: boolean; id: number; name: string; stock: number }>({ open: false, id: 0, name: '', stock: 0 });
  const [newQty, setNewQty] = useState(0);

  useEffect(() => { fetchData(); }, [statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await getInventory(params);
      setItems(res.data.items || []);
      setStats(res.data.stats || { totalItems: 0, totalUnits: 0, lowStock: 0, critical: 0 });
    } catch { /* API not available */ }
    finally { setLoading(false); }
  };

  const handleUpdateStock = async () => {
    try {
      await updateStock(updateModal.id, newQty);
      message.success('Stock updated!');
      setUpdateModal({ open: false, id: 0, name: '', stock: 0 });
      fetchData();
    } catch { message.error('Failed to update stock'); }
  };

  const columns = [
    {
      title: 'Product', dataIndex: 'product_name',
      render: (name: string, r: any) => (
        <div><Text strong>{name}</Text><br /><Text type="secondary" style={{ fontSize: '0.8rem' }}>{r.category_name}</Text></div>
      ),
    },
    {
      title: 'Available', dataIndex: 'available_qty',
      render: (v: number, r: any) => {
        if (r.status === 'critical') return <Badge status="error" text={<Text type="danger" strong>{v}</Text>} />;
        if (r.status === 'low') return <Badge status="warning" text={<Text style={{ color: '#faad14' }} strong>{v}</Text>} />;
        return <Badge status="success" text={<Text style={{ color: '#52c41a' }}>{v}</Text>} />;
      },
    },
    { title: 'Reserved', dataIndex: 'reserved_qty' },
    { title: 'Threshold', dataIndex: 'low_stock_threshold' },
    {
      title: 'Status', dataIndex: 'status',
      render: (s: string) => {
        if (s === 'critical') return <Tag color="red" icon={<WarningOutlined />}>Critical</Tag>;
        if (s === 'low') return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">In Stock</Tag>;
      },
    },
    {
      title: 'Actions',
      render: (_: unknown, r: any) => (
        <Button type="primary" size="small" icon={<SyncOutlined />}
          onClick={() => { setUpdateModal({ open: true, id: r.product_id, name: r.product_name, stock: r.available_qty }); setNewQty(r.available_qty); }}>
          Update
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-4">
        {[
          { title: 'Total Items', value: stats.totalItems, color: '#1890ff' },
          { title: 'Total Units', value: stats.totalUnits, color: '#52c41a' },
          { title: 'Low Stock', value: stats.lowStock, color: '#faad14' },
          { title: 'Critical', value: stats.critical, color: '#ff4d4f' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <Card style={{ borderRadius: 12, borderTop: `3px solid ${s.color}` }} bodyStyle={{ padding: '16px 20px' }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontSize: '1.5rem' }} />
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Inventory</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." style={{ width: 250 }} value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 140 }} options={[
            { value: '', label: 'All Status' }, { value: 'low', label: 'Low Stock' }, { value: 'critical', label: 'Critical' },
          ]} />
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={items.map((it: any) => ({ ...it, key: it.product_id }))} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title={`Update Stock — ${updateModal.name}`} open={updateModal.open} onCancel={() => setUpdateModal({ open: false, id: 0, name: '', stock: 0 })} onOk={handleUpdateStock}>
        <div className="mb-3"><Text>Current Stock: <Text strong>{updateModal.stock}</Text></Text></div>
        <InputNumber className="w-100" size="large" min={0} value={newQty} onChange={(v) => setNewQty(v || 0)} addonBefore="New Qty" />
      </Modal>
    </div>
  );
};

export default AdminInventory;
