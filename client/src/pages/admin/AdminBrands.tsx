import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Space, Typography, Card, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBrands, createBrand, deleteBrand } from '../../services/api';

const { Title } = Typography;

const AdminBrands = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try { const res = await getBrands(); setBrands(res.data || []); }
    catch { /* API not available */ }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createBrand(values);
      message.success('Brand created!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch { /* validation */ }
  };

  const handleDelete = async (id: number) => {
    try { await deleteBrand(id); message.success('Brand deleted'); fetchData(); }
    catch { message.error('Cannot delete — may have products linked'); }
  };

  const columns = [
    { title: 'Brand', dataIndex: 'brand_name', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: 'Active', dataIndex: 'is_active', render: (v: any) => <Switch checked={!!v} size="small" /> },
    {
      title: 'Actions',
      render: (_: unknown, r: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.brand_id)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{ margin: 0 }}>Brand Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Brand</Button>
      </div>
      <Card style={{ borderRadius: 12 }}>
        <Table columns={columns} dataSource={brands.map((b: any) => ({ ...b, key: b.brand_id }))} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="Add Brand" open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleCreate}>
        <Form form={form} layout="vertical">
          <Form.Item name="brand_name" label="Brand Name" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminBrands;
