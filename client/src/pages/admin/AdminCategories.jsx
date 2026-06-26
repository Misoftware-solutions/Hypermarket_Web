import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, Typography, Card, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, createCategory, deleteCategory } from '../../services/api';
const {
  Title
} = Typography;
const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch {/* API not available */} finally {
      setLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createCategory(values);
      message.success('Category created!');
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch {/* validation */}
  };
  const handleDelete = async id => {
    try {
      await deleteCategory(id);
      message.success('Category deleted');
      fetchData();
    } catch {
      message.error('Cannot delete — may have products linked');
    }
  };
  const columns = [{
    title: 'Name',
    dataIndex: 'category_name',
    render: v => <Tag color="blue">{v}</Tag>
  }, {
    title: 'Active',
    dataIndex: 'is_active',
    render: v => <Switch checked={!!v} size="small" />
  }, {
    title: 'Actions',
    render: (_, r) => <Space>
          <Button type="link" icon={<EditOutlined />} />
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.category_id)} />
        </Space>
  }];
  return <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{
        margin: 0
      }}>Category Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Category</Button>
      </div>
      <Card style={{
      borderRadius: 12
    }}>
        <Table columns={columns} dataSource={categories.map(c => ({
        ...c,
        key: c.category_id
      }))} loading={loading} pagination={{
        pageSize: 10
      }} />
      </Card>
      <Modal title="Add Category" open={isModalOpen} onCancel={() => { setIsModalOpen(false); form.resetFields(); }} onOk={handleCreate}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="category_name"
            label="Category Name"
            tooltip="Name of the product category (e.g. Dairy, Fruits, Bakery)"
            rules={[{ required: true, message: 'Please enter category name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parent_id"
            label="Parent Category"
            tooltip="If this is a subcategory, select its parent category; otherwise, leave blank for a root category"
          >
            <Select allowClear placeholder="None (Root)" options={categories.map(c => ({
              value: c.category_id,
              label: c.category_name
            }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>;
};
export default AdminCategories;