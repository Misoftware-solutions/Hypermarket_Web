import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Card, Switch, Upload, Row, Col, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InboxOutlined, EyeOutlined } from '@ant-design/icons';
import { getAllBanners, createBanner, deleteBanner } from '../../services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await getAllBanners(); setBanners(res.data || []); }
    catch { /* API not available */ }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createBanner(values);
      message.success('Banner created!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch { /* validation */ }
  };

  const handleDelete = async (id: number) => {
    await deleteBanner(id);
    message.success('Banner deleted');
    fetchData();
  };

  const columns = [
    {
      title: 'Banner', dataIndex: 'title',
      render: (title: string) => (
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 80, height: 45, borderRadius: 8, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: '0.6rem' }}>Banner</Text>
          </div>
          <Text strong>{title}</Text>
        </div>
      ),
    },
    { title: 'Position', dataIndex: 'position', render: (v: string) => <Tag color={v === 'home_top' ? 'blue' : v === 'popup' ? 'purple' : 'cyan'}>{v || 'home_top'}</Tag> },
    { title: 'Link', dataIndex: 'link_url', render: (v: string) => <Text type="secondary" style={{ fontSize: '0.8rem' }}>{v}</Text> },
    { title: 'Sort', dataIndex: 'sort_order' },
    { title: 'Active', dataIndex: 'is_active', render: (v: any) => <Switch checked={!!v} size="small" /> },
    {
      title: 'Actions',
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewBanner(r)} style={{ color: '#1890ff' }} />
          <Button type="text" icon={<EditOutlined />} style={{ color: '#faad14' }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.banner_id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Banners & Offers</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Banner</Button>
      </div>
      <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 0 }}>
        <Table columns={columns} dataSource={banners.map((b: any) => ({ ...b, key: b.banner_id }))} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="Add Banner" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleCreate} width={650}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="title" label="Banner Title" rules={[{ required: true }]}><Input placeholder="e.g. Summer Sale 50% Off" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Position">
                <Select options={[{ value: 'home_top', label: 'Home - Top Carousel' }, { value: 'category', label: 'Category Page' }, { value: 'popup', label: 'Popup' }]} />
              </Form.Item>
            </Col>
            <Col span={12}><Form.Item name="link_url" label="Link URL"><Input placeholder="/products?category=1" /></Form.Item></Col>
          </Row>
          <Form.Item name="image_url" label="Banner Image">
            <Dragger accept="image/*">
              <p className="ant-upload-drag-icon"><InboxOutlined style={{ fontSize: 40, color: '#1890ff' }} /></p>
              <p className="ant-upload-text">Click or drag banner image</p>
            </Dragger>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="sort_order" label="Sort Order"><Input type="number" placeholder="1" /></Form.Item></Col>
            <Col span={12}><Form.Item name="is_active" label="Active" valuePropName="checked"><Switch defaultChecked /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
      <Modal title="Banner Preview" open={!!previewBanner} onCancel={() => setPreviewBanner(null)} footer={null} width={700}>
        {previewBanner && (
          <div>
            <div style={{ height: 200, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ color: '#fff', margin: 0 }}>{previewBanner.title}</Title>
            </div>
            <Row gutter={16}>
              <Col span={8}><Text type="secondary">Position</Text><br /><Tag color="blue">{previewBanner.position}</Tag></Col>
              <Col span={8}><Text type="secondary">Link</Text><br /><Text>{previewBanner.link_url}</Text></Col>
              <Col span={8}><Text type="secondary">Status</Text><br /><Tag color={previewBanner.is_active ? 'green' : 'red'}>{previewBanner.is_active ? 'Active' : 'Inactive'}</Tag></Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminBanners;
