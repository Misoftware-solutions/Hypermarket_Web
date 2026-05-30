import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, Card, Switch, Upload, Row, Col, Statistic, Badge, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, InboxOutlined } from '@ant-design/icons';
import { getProducts, getCategories, getBrands, createProduct, deleteProduct } from '../../services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([getProducts({ limit: 100 }), getCategories(), getBrands()]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch { /* API not available */ }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createProduct(values);
      message.success('Product created!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch { /* validation error */ }
  };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
    message.success('Product deactivated');
    fetchData();
  };

  const filtered = products.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = filtered.filter(p => p.is_active).length;
  const outOfStock = filtered.filter(p => (p.stock_qty || 0) === 0).length;
  const featuredCount = filtered.filter(p => p.is_featured).length;

  const columns = [
    {
      title: 'Product', dataIndex: 'product_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    { title: 'Category', dataIndex: 'category_name', render: (c: string) => <Tag color="blue">{c}</Tag> },
    { title: 'Brand', dataIndex: 'brand_name' },
    { title: 'MRP', dataIndex: 'mrp', render: (v: number) => <Text type="secondary">₹{v}</Text>, width: 80 },
    { title: 'Selling', dataIndex: 'selling_price', render: (v: number) => <Text strong>₹{v}</Text>, width: 90 },
    { title: 'Offer', dataIndex: 'offer_price', render: (v: number | null) => v ? <Tag color="green">₹{v}</Tag> : '—', width: 80 },
    {
      title: 'Stock', dataIndex: 'stock_qty',
      render: (v: number) => {
        const qty = v || 0;
        if (qty === 0) return <Badge status="error" text={<Text type="danger">Out</Text>} />;
        if (qty < 20) return <Badge status="warning" text={<Text style={{ color: '#faad14' }}>{qty}</Text>} />;
        return <Badge status="success" text={<Text style={{ color: '#52c41a' }}>{qty}</Text>} />;
      }, width: 100,
    },
    {
      title: 'Actions', width: 100,
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} style={{ color: '#1890ff' }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.product_id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} className="mb-4">
        {[
          { title: 'Total', value: filtered.length, color: '#1890ff' },
          { title: 'Active', value: activeCount, color: '#52c41a' },
          { title: 'Out of Stock', value: outOfStock, color: '#ff4d4f' },
          { title: 'Featured', value: featuredCount, color: '#722ed1' },
        ].map((s, i) => (
          <Col xs={12} md={6} key={i}>
            <Card style={{ borderRadius: 12, borderTop: `3px solid ${s.color}` }} bodyStyle={{ padding: '16px 20px' }}>
              <Statistic title={s.title} value={s.value} valueStyle={{ color: s.color, fontSize: '1.5rem' }} />
            </Card>
          </Col>
        ))}
      </Row>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Products</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." style={{ width: 250 }} value={search} onChange={e => setSearch(e.target.value)} />
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Product</Button>
        </Space>
      </div>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={filtered.map(p => ({ ...p, key: p.product_id }))} loading={loading} pagination={{ pageSize: 10, showTotal: t => `${t} products` }} />
      </Card>
      <Modal title="Add New Product" open={isModalOpen} onCancel={() => setIsModalOpen(false)} width={720} onOk={handleCreate}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="product_name" label="Product Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="category_id" label="Category" rules={[{ required: true }]}><Select options={categories.map(c => ({ value: c.category_id, label: c.category_name }))} /></Form.Item></Col>
            <Col span={12}><Form.Item name="brand_id" label="Brand"><Select options={brands.map(b => ({ value: b.brand_id, label: b.brand_name }))} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="mrp" label="MRP (₹)" rules={[{ required: true }]}><InputNumber className="w-100" min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="selling_price" label="Selling Price (₹)" rules={[{ required: true }]}><InputNumber className="w-100" min={0} /></Form.Item></Col>
            <Col span={8}><Form.Item name="offer_price" label="Offer Price (₹)"><InputNumber className="w-100" min={0} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="tax_percent" label="Tax %"><InputNumber className="w-100" min={0} max={100} /></Form.Item></Col>
            <Col span={8}><Form.Item name="unit_id" label="Unit"><Select options={[{value:1,label:'kg'},{value:2,label:'g'},{value:3,label:'ltr'},{value:5,label:'pcs'},{value:6,label:'pack'}]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="is_featured" label="Featured" valuePropName="checked"><Switch /></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="Description"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="Product Images">
            <Dragger multiple listType="picture" accept="image/*">
              <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 40, color: '#1890ff' }} /></p>
              <p className="ant-upload-text">Click or drag images to upload</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
