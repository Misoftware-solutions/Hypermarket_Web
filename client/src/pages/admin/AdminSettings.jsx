import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Form, Input, Switch, Select, Button, Divider, Tabs, InputNumber, Upload, message, Spin } from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { getSettings, updateSettings } from '../../services/api';

const { Title, Text } = Typography;

const AdminSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const res = await getSettings();
        const data = res.data || {};
        
        // Convert string values to numbers/booleans for form compatibility
        form.setFieldsValue({
          store_name: data.store_name,
          email: data.email,
          phone: data.phone,
          gst: data.gst,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          min_order_amount: Number(data.min_order_amount || 0),
          free_delivery_threshold: Number(data.free_delivery_threshold || 0),
          delivery_charge: Number(data.delivery_charge || 0),
          express_delivery_charge: Number(data.express_delivery_charge || 0),
          default_tax: Number(data.default_tax || 0),
          show_tax_breakup: data.show_tax_breakup === 'true',
        });
      } catch (err) {
        message.error('Failed to load store settings');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreSettings();
  }, [form]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // Prepare values for database storage
      const payload = {
        ...values,
        show_tax_breakup: values.show_tax_breakup ? 'true' : 'false',
      };
      await updateSettings(payload);
      message.success('Settings saved successfully!');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spin size="large" />
      </div>
    );
  }

  const tabItems = [
    {
      key: 'general',
      label: '🏪 Store Info',
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="store_name" label="Store Name" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Contact Email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gst" label="GST Number">
                <Input placeholder="22AAAAA0000A1Z5" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="city" label="City" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="state" label="State" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'delivery',
      label: '🚚 Delivery',
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_order_amount" label="Minimum Order Amount (₹)">
                <InputNumber className="w-100" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="free_delivery_threshold" label="Free Delivery Above (₹)">
                <InputNumber className="w-100" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="delivery_charge" label="Delivery Charge (₹)">
                <InputNumber className="w-100" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="express_delivery_charge" label="Express Delivery Slot Extra Fee (₹)">
                <InputNumber className="w-100" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'tax',
      label: '📋 Tax & Invoice',
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="default_tax" label="Default Tax %">
                <InputNumber className="w-100" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="show_tax_breakup" label="Show Tax Breakup on Invoice" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Form form={form} layout="vertical" size="large" onFinish={handleSave}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={3} style={{ margin: 0 }}>Settings</Title>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
            Save All Changes
          </Button>
        </div>
        <Tabs items={tabItems} tabPosition="left" style={{ minHeight: 500 }} />
      </Form>
    </div>
  );
};

export default AdminSettings;