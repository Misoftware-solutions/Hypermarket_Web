import { Card, Row, Col, Typography, Form, Input, Switch, Select, Button, Divider, Tabs, InputNumber, Upload, message } from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
const {
  Title,
  Text
} = Typography;
const AdminSettings = () => {
  const tabItems = [{
    key: 'general',
    label: '🏪 Store Info',
    children: <Card style={{
      borderRadius: 12
    }}>
          <Form layout="vertical" size="large" initialValues={{
        store_name: 'Hypermarket',
        email: 'support@hypermarket.com',
        phone: '+91 98765 43210',
        address: '123, MG Road, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034'
      }}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="store_name" label="Store Name"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="email" label="Contact Email"><Input /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="phone" label="Phone"><Input /></Form.Item></Col>
              <Col span={12}><Form.Item name="gst" label="GST Number"><Input placeholder="22AAAAA0000A1Z5" /></Form.Item></Col>
            </Row>
            <Form.Item name="address" label="Address"><Input /></Form.Item>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="city" label="City"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="state" label="State"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="pincode" label="Pincode"><Input /></Form.Item></Col>
            </Row>
            <Form.Item name="logo" label="Store Logo">
              <Upload listType="picture" maxCount={1}><Button icon={<UploadOutlined />}>Upload Logo</Button></Upload>
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Settings saved!')}>Save Changes</Button>
          </Form>
        </Card>
  }, {
    key: 'delivery',
    label: '🚚 Delivery',
    children: <Card style={{
      borderRadius: 12
    }}>
          <Form layout="vertical" size="large" initialValues={{
        min_order: 200,
        free_delivery: 500,
        delivery_charge: 40,
        delivery_radius: 10
      }}>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="min_order" label="Minimum Order Amount (₹)"><InputNumber className="w-100" min={0} /></Form.Item></Col>
              <Col span={12}><Form.Item name="free_delivery" label="Free Delivery Above (₹)"><InputNumber className="w-100" min={0} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="delivery_charge" label="Delivery Charge (₹)"><InputNumber className="w-100" min={0} /></Form.Item></Col>
              <Col span={12}><Form.Item name="delivery_radius" label="Delivery Radius (km)"><InputNumber className="w-100" min={1} /></Form.Item></Col>
            </Row>
            <Divider />
            <Title level={5}>Delivery Slots</Title>
            <Row gutter={16}>
              <Col span={8}><Form.Item label="Express (1-2 hrs)"><Switch defaultChecked /> <Text className="ms-2">₹30 extra</Text></Form.Item></Col>
              <Col span={8}><Form.Item label="Same Day (4-6 hrs)"><Switch defaultChecked /></Form.Item></Col>
              <Col span={8}><Form.Item label="Next Day"><Switch defaultChecked /></Form.Item></Col>
            </Row>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Delivery settings saved!')}>Save</Button>
          </Form>
        </Card>
  }, {
    key: 'payment',
    label: '💳 Payment',
    children: <Card style={{
      borderRadius: 12
    }}>
          <Form layout="vertical" size="large">
            <Title level={5}>Payment Methods</Title>
            <Row gutter={[16, 16]}>
              <Col span={8}><Form.Item label="Cash on Delivery"><Switch defaultChecked /></Form.Item></Col>
              <Col span={8}><Form.Item label="Online Payment (Razorpay)"><Switch defaultChecked /></Form.Item></Col>
              <Col span={8}><Form.Item label="Wallet Payment"><Switch defaultChecked /></Form.Item></Col>
            </Row>
            <Divider />
            <Title level={5}>Razorpay Integration</Title>
            <Row gutter={16}>
              <Col span={12}><Form.Item name="razorpay_key" label="Razorpay Key ID"><Input placeholder="rzp_live_xxxxx" /></Form.Item></Col>
              <Col span={12}><Form.Item name="razorpay_secret" label="Razorpay Key Secret"><Input.Password placeholder="Secret key" /></Form.Item></Col>
            </Row>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Payment settings saved!')}>Save</Button>
          </Form>
        </Card>
  }, {
    key: 'tax',
    label: '📋 Tax & Invoice',
    children: <Card style={{
      borderRadius: 12
    }}>
          <Form layout="vertical" size="large" initialValues={{
        default_tax: 5,
        invoice_prefix: 'INV'
      }}>
            <Row gutter={16}>
              <Col span={8}><Form.Item name="default_tax" label="Default Tax %"><InputNumber className="w-100" min={0} max={100} /></Form.Item></Col>
              <Col span={8}><Form.Item name="invoice_prefix" label="Invoice Prefix"><Input /></Form.Item></Col>
              <Col span={8}><Form.Item name="financial_year" label="Financial Year"><Select options={[{
                value: '2025-26',
                label: '2025-26'
              }, {
                value: '2026-27',
                label: '2026-27'
              }]} /></Form.Item></Col>
            </Row>
            <Form.Item label="Show Tax Breakup on Invoice"><Switch defaultChecked /></Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Tax settings saved!')}>Save</Button>
          </Form>
        </Card>
  }];
  return <div>
      <Title level={3}>Settings</Title>
      <Tabs items={tabItems} tabPosition="left" style={{
      minHeight: 500
    }} />
    </div>;
};
export default AdminSettings;