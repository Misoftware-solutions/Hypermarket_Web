import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, Card, Switch, Row, Col, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, HolderOutlined } from '@ant-design/icons';
import { getAllBanners, createBanner, updateBanner, deleteBanner, uploadBannerImage } from '../../services/api';
const {
  Title,
  Text
} = Typography;

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllBanners();
      const sorted = (res.data || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setBanners(sorted);
    } catch {/* API not available */} finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reordered = [...banners];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(dropIndex, 0, movedItem);

    // Update sort_order for each banner
    const updated = reordered.map((b, idx) => ({
      ...b,
      sort_order: idx + 1
    }));

    setBanners(updated);
    setDraggedIndex(null);

    try {
      await Promise.all(
        updated.map(b => updateBanner(b.banner_id, { sort_order: b.sort_order }))
      );
      message.success('Banner order updated');
    } catch {
      message.error('Failed to save new order');
      fetchData();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Normalize image URL
      let imageUrl = values.image_url || '';
      imageUrl = imageUrl.replace(/\\/g, '/');
      const srcImagesMatch = imageUrl.match(/(?:client\/src\/images|src\/images)\/(.+)$/i);
      const publicMatch = imageUrl.match(/(?:client\/public|public)\/(.+)$/i);
      if (srcImagesMatch) {
        imageUrl = `/images/${srcImagesMatch[1]}`;
      } else if (publicMatch) {
        imageUrl = `/${publicMatch[1]}`;
      }

      const payload = {
        ...values,
        image_url: imageUrl,
        is_active: values.is_active ? 1 : 0
      };
      
      if (editingBanner) {
        await updateBanner(editingBanner.banner_id, payload);
        message.success('Banner updated successfully!');
      } else {
        await createBanner(payload);
        message.success('Banner created successfully!');
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      form.resetFields();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id, checked) => {
    try {
      const banner = banners.find(b => b.banner_id === id);
      if (!banner) return;
      await updateBanner(id, {
        ...banner,
        is_active: checked ? 1 : 0
      });
      message.success('Banner status updated!');
      fetchData();
    } catch {
      message.error('Failed to update status');
    }
  };

  const handleDelete = async id => {
    try {
      await deleteBanner(id);
      message.success('Banner deleted');
      fetchData();
    } catch {
      message.error('Failed to delete banner');
    }
  };

  const columns = [
    {
      title: '',
      key: 'drag_handle',
      width: 40,
      render: () => (
        <HolderOutlined style={{ cursor: 'grab', color: '#999', fontSize: 16 }} />
      )
    },
    {
      title: 'Banner',
      dataIndex: 'title',
      render: (_, r) => <div className="d-flex align-items-center gap-3">
            <div style={{
          width: 80,
          height: 45,
          borderRadius: 8,
          background: r.image_url && !r.image_url.includes('[object') ? `url("${encodeURI(r.image_url)}") center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
              {!r.image_url || r.image_url.includes('[object') ? (
                <Text style={{ color: '#fff', fontSize: '0.6rem' }}>Banner</Text>
              ) : null}
            </div>
            <Text strong>{r.title}</Text>
          </div>
    }, {
      title: 'Position',
      dataIndex: 'position',
      render: v => <Tag color={v === 'home_top' ? 'blue' : v === 'popup' ? 'purple' : 'cyan'}>{v || 'home_top'}</Tag>
    }, {
      title: 'Link',
      dataIndex: 'link_url',
      render: v => <Text type="secondary" style={{
        fontSize: '0.8rem'
      }}>{v || '—'}</Text>
    }, {
      title: 'Sort Order',
      dataIndex: 'sort_order',
      render: v => <Tag color="geekblue">#{v}</Tag>
    }, {
      title: 'Active',
      dataIndex: 'is_active',
      render: (v, r) => <Switch checked={!!v} size="small" onChange={(checked) => handleToggleActive(r.banner_id, checked)} />
    }, {
      title: 'Actions',
      render: (_, r) => <Space>
            <Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewBanner(r)} style={{
          color: '#1890ff'
        }} />
            <Button type="text" icon={<EditOutlined />} onClick={() => {
              setEditingBanner(r);
              form.setFieldsValue({
                title: r.title,
                position: r.position || 'home_top',
                link_url: r.link_url,
                image_url: r.image_url,
                sort_order: r.sort_order,
                is_active: !!r.is_active
              });
              setIsModalOpen(true);
            }} style={{
              color: '#faad14'
            }} />
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.banner_id)} />
          </Space>
    }
  ];

  return <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{
        margin: 0
      }}>Banners & Offers</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingBanner(null);
          form.resetFields();
          setIsModalOpen(true);
        }}>Add Banner</Button>
      </div>
      <Card style={{
      borderRadius: 12
    }} bodyStyle={{
      padding: 0
    }}>
        <Table
          columns={columns}
          dataSource={banners.map((b, index) => ({
            ...b,
            key: b.banner_id,
            index
          }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRow={(record, index) => ({
            draggable: true,
            onDragStart: (e) => handleDragStart(e, index),
            onDragOver: (e) => handleDragOver(e, index),
            onDrop: (e) => handleDrop(e, index),
            style: {
              cursor: 'move',
              backgroundColor: dragOverIndex === index ? '#e6f7ff' : draggedIndex === index ? '#f5f5f5' : 'inherit',
              transition: 'background-color 0.2s ease'
            }
          })}
        />
      </Card>

      <Modal 
        title={editingBanner ? "Edit Banner" : "Add Banner"} 
        open={isModalOpen} 
        onCancel={() => { setIsModalOpen(false); setEditingBanner(null); form.resetFields(); }} 
        onOk={handleSubmit} 
        width={650}
      >
        <Form form={form} layout="vertical" size="large" initialValues={{ is_active: true, position: 'home_top', sort_order: 0 }}>
          <Form.Item
            name="title"
            label="Banner Title"
            tooltip="Enter a title or heading to display on the banner advertisement (e.g. Fresh Fruits 30% Off)"
            rules={[{
              required: true,
              message: 'Please enter banner title'
            }]}
          >
            <Input placeholder="e.g. Summer Sale 50% Off" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                tooltip="Select the area on the website where this banner should display"
              >
                <Select options={[{
                  value: 'home_top',
                  label: 'Home - Top Carousel'
                }, {
                  value: 'category',
                  label: 'Category Page'
                }, {
                  value: 'popup',
                  label: 'Popup'
                }]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="link_url"
                label="Link URL"
                tooltip="The website page URL (e.g. /products?category=1) to navigate to when the user clicks this banner"
              >
                <Input placeholder="/products?category=1" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="image_url"
            label="Banner Image URL"
            tooltip="The URL or local file path of the banner image. You can also upload one using the Upload button."
            rules={[{
              required: true,
              message: 'Please enter banner image URL'
            }]}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input placeholder="e.g. /banners/banner1.jpg or https://images.unsplash.com/..." />
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={async (file) => {
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const base64Data = e.target.result;
                    try {
                      message.loading({ content: 'Uploading image...', key: 'uploading' });
                      const res = await uploadBannerImage({
                        fileName: file.name,
                        fileData: base64Data
                      });
                      if (res.data && res.data.success) {
                        form.setFieldsValue({ image_url: res.data.url });
                        message.success({ content: 'Image uploaded successfully!', key: 'uploading' });
                      } else {
                        message.error({ content: 'Failed to upload image', key: 'uploading' });
                      }
                    } catch (err) {
                      message.error({ content: err.response?.data?.error || 'Failed to upload image', key: 'uploading' });
                    }
                  };
                  reader.readAsDataURL(file);
                  return false; // prevent default upload action
                }}
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
            </div>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sort_order"
                label="Sort Order"
                tooltip="Display order sequence (smaller numbers display first, integers only)"
              >
                <InputNumber className="w-100" min={0} precision={0} step={1} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="is_active"
                label="Active"
                tooltip="Toggle whether this banner is actively displayed on the site"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal title="Banner Preview" open={!!previewBanner} onCancel={() => setPreviewBanner(null)} footer={null} width={700}>
        {previewBanner && <div>
            <div style={{
          height: 200,
          borderRadius: 12,
          background: previewBanner.image_url && !previewBanner.image_url.includes('[object') ? `url("${encodeURI(previewBanner.image_url)}") center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16
        }}>
              {!previewBanner.image_url || previewBanner.image_url.includes('[object') ? (
                <Title level={3} style={{ color: '#fff', margin: 0 }}>{previewBanner.title}</Title>
              ) : null}
            </div>
            <Row gutter={16}>
              <Col span={8}><Text type="secondary">Position</Text><br /><Tag color="blue">{previewBanner.position}</Tag></Col>
              <Col span={8}><Text type="secondary">Link</Text><br /><Text>{previewBanner.link_url || '—'}</Text></Col>
              <Col span={8}><Text type="secondary">Status</Text><br /><Tag color={previewBanner.is_active ? 'green' : 'red'}>{previewBanner.is_active ? 'Active' : 'Inactive'}</Tag></Col>
            </Row>
          </div>}
      </Modal>
    </div>;
};
export default AdminBanners;