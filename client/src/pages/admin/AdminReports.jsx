import { Card, Row, Col, Typography, Statistic, DatePicker, Select, Button, Table, Tag, Space } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined, DownloadOutlined } from '@ant-design/icons';
const {
  Title,
  Text
} = Typography;
const {
  RangePicker
} = DatePicker;
const AdminReports = () => {
  const salesByCategory = [{
    key: 1,
    category: '🥬 Fruits & Vegetables',
    orders: 320,
    revenue: 48500,
    growth: 12.5
  }, {
    key: 2,
    category: '🥛 Dairy & Eggs',
    orders: 280,
    revenue: 35600,
    growth: 8.3
  }, {
    key: 3,
    category: '🛒 Groceries',
    orders: 450,
    revenue: 89200,
    growth: 15.1
  }, {
    key: 4,
    category: '🍞 Bakery',
    orders: 180,
    revenue: 12800,
    growth: -3.2
  }, {
    key: 5,
    category: '🧃 Beverages',
    orders: 210,
    revenue: 28400,
    growth: 5.7
  }, {
    key: 6,
    category: '🍿 Snacks',
    orders: 190,
    revenue: 18900,
    growth: 9.4
  }];
  const topProducts = [{
    key: 1,
    product: 'Aashirvaad Atta 10kg',
    sold: 85,
    revenue: 34850
  }, {
    key: 2,
    product: 'India Gate Basmati 5kg',
    sold: 72,
    revenue: 27360
  }, {
    key: 3,
    product: 'Amul Taza Milk 1L',
    sold: 310,
    revenue: 17360
  }, {
    key: 4,
    product: 'Nestle Maggi 8-Pack',
    sold: 145,
    revenue: 13920
  }, {
    key: 5,
    product: 'Fresh Red Apples',
    sold: 95,
    revenue: 11400
  }];
  return <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Title level={3} style={{
        margin: 0
      }}>Reports & Analytics</Title>
        <Space>
          <RangePicker />
          <Select defaultValue="monthly" style={{
          width: 130
        }} options={[{
          value: 'daily',
          label: 'Daily'
        }, {
          value: 'weekly',
          label: 'Weekly'
        }, {
          value: 'monthly',
          label: 'Monthly'
        }, {
          value: 'yearly',
          label: 'Yearly'
        }]} />
          <Button type="primary" icon={<DownloadOutlined />}>Download Report</Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} className="mb-4">
        {[{
        title: 'Total Revenue',
        value: 245600,
        prefix: '₹',
        icon: <DollarOutlined />,
        color: '#1890ff',
        change: '+12.5%',
        up: true
      }, {
        title: 'Total Orders',
        value: 1250,
        icon: <ShoppingCartOutlined />,
        color: '#52c41a',
        change: '+8.2%',
        up: true
      }, {
        title: 'New Customers',
        value: 180,
        icon: <UserOutlined />,
        color: '#722ed1',
        change: '+15.3%',
        up: true
      }, {
        title: 'Avg Order Value',
        value: 392,
        prefix: '₹',
        icon: <DollarOutlined />,
        color: '#fa8c16',
        change: '-2.1%',
        up: false
      }].map((s, i) => <Col xs={12} md={6} key={i}>
            <Card style={{
          borderRadius: 12,
          borderTop: `3px solid ${s.color}`
        }} bodyStyle={{
          padding: '16px 20px'
        }}>
              <Statistic title={s.title} value={s.value} prefix={s.prefix} valueStyle={{
            color: s.color,
            fontSize: '1.4rem'
          }} />
              <Tag color={s.up ? 'green' : 'red'} className="mt-1">{s.up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {s.change}</Tag>
            </Card>
          </Col>)}
      </Row>

      {/* Revenue Chart Placeholder */}
      <Card title="Revenue Trend" className="mb-4" style={{
      borderRadius: 12
    }}>
        <div style={{
        height: 250,
        background: 'linear-gradient(180deg, #e6f7ff 0%, #fff 100%)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <div className="text-center">
            <Text type="secondary" style={{
            fontSize: '1.1rem'
          }}>📊 Revenue chart will render here</Text>
            <br /><Text type="secondary" style={{
            fontSize: '0.85rem'
          }}>Integrate Recharts or Chart.js for live data</Text>
          </div>
        </div>
      </Card>

      <Row gutter={16}>
        {/* Sales by Category */}
        <Col xs={24} md={14}>
          <Card title="Sales by Category" style={{
          borderRadius: 12
        }}>
            <Table dataSource={salesByCategory} pagination={false} size="small" columns={[{
            title: 'Category',
            dataIndex: 'category'
          }, {
            title: 'Orders',
            dataIndex: 'orders'
          }, {
            title: 'Revenue',
            dataIndex: 'revenue',
            render: v => <Text strong>₹{v.toLocaleString()}</Text>
          }, {
            title: 'Growth',
            dataIndex: 'growth',
            render: v => <Tag color={v >= 0 ? 'green' : 'red'}>{v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(v)}%</Tag>
          }]} />
          </Card>
        </Col>

        {/* Top Selling Products */}
        <Col xs={24} md={10}>
          <Card title="Top Selling Products" style={{
          borderRadius: 12
        }} extra={<Tag color="blue">This Month</Tag>}>
            <Table dataSource={topProducts} pagination={false} size="small" columns={[{
            title: '#',
            render: (_, __, i) => <Tag color="gold">{i + 1}</Tag>
          }, {
            title: 'Product',
            dataIndex: 'product'
          }, {
            title: 'Sold',
            dataIndex: 'sold'
          }, {
            title: 'Revenue',
            dataIndex: 'revenue',
            render: v => `₹${v.toLocaleString()}`
          }]} />
          </Card>
        </Col>
      </Row>
    </div>;
};
export default AdminReports;