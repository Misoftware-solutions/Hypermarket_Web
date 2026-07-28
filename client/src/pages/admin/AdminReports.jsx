import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Table, Tag, Tabs, Select, Statistic, Spin, Alert, Progress } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, LineChartOutlined, PercentageOutlined, FileTextOutlined, WarningOutlined, UserOutlined, TagOutlined, ShoppingOutlined } from '@ant-design/icons';
import { 
  getSalesReport, 
  getCategoryBrandReport, 
  getProductPerformanceReport, 
  getInventoryReportData, 
  getTaxReport, 
  getProfitReport,
  getCustomerMetricsReport,
  getCartAbandonmentReport,
  getCouponAnalyticsReport
} from '../../services/api';

const { Title, Text } = Typography;

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30days');
  const [salesData, setSalesData] = useState(null);
  const [catBrandData, setCatBrandData] = useState({ byCategory: [], byBrand: [] });
  const [prodPerfData, setProdPerfData] = useState({ topProducts: [], slowMoving: [] });
  const [invData, setInvData] = useState({ lowStock: [], valuation: {} });
  const [taxData, setTaxData] = useState([]);
  const [profitData, setProfitData] = useState([]);
  const [customerData, setCustomerData] = useState({ topCustomers: [], inactiveCustomers: [], ratio: {} });
  const [cartData, setCartData] = useState([]);
  const [couponData, setCouponData] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, [period]);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [salesRes, catBrandRes, prodPerfRes, invRes, taxRes, profitRes, custRes, cartRes, couponRes] = await Promise.all([
        getSalesReport(period),
        getCategoryBrandReport(),
        getProductPerformanceReport(),
        getInventoryReportData(),
        getTaxReport(),
        getProfitReport(),
        getCustomerMetricsReport(),
        getCartAbandonmentReport(),
        getCouponAnalyticsReport()
      ]);

      setSalesData(salesRes.data);
      setCatBrandData(catBrandRes.data);
      setProdPerfData(prodPerfRes.data);
      setInvData(invRes.data);
      setTaxData(taxRes.data);
      setProfitData(profitRes.data);
      setCustomerData(custRes.data);
      setCartData(cartRes.data);
      setCouponData(couponRes.data);
    } catch (err) {
      console.error('Failed to load ERP reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const salesSummary = salesData?.summary || {};

  const topProductColumns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name', render: v => <Text strong>{v}</Text> },
    { title: 'Category', dataIndex: 'category_name', key: 'category_name', render: v => <Tag color="blue">{v || 'N/A'}</Tag> },
    { title: 'Selling Price', dataIndex: 'selling_price', key: 'selling_price', render: v => `₹${v}` },
    { title: 'Qty Sold', dataIndex: 'total_qty_sold', key: 'total_qty_sold', render: v => <Text strong style={{ color: '#52c41a' }}>{v}</Text> },
    { title: 'Total Revenue', dataIndex: 'total_revenue', key: 'total_revenue', render: v => <Text strong>₹{v}</Text> }
  ];

  const slowMovingColumns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Category', dataIndex: 'category_name', key: 'category_name', render: v => <Tag>{v || 'N/A'}</Tag> },
    { title: 'In Stock', dataIndex: 'stock_qty', key: 'stock_qty', render: v => <Tag color={v === 0 ? 'red' : 'orange'}>{v} units</Tag> },
    { title: 'Qty Sold', dataIndex: 'total_qty_sold', key: 'total_qty_sold', render: v => `${v} sold` }
  ];

  const taxColumns = [
    { title: 'HSN Code', dataIndex: 'hsn_code', key: 'hsn_code', render: v => <Text strong>{v}</Text> },
    { title: 'GST Rate', dataIndex: 'tax_percent', key: 'tax_percent', render: v => <Tag color="purple">{v}%</Tag> },
    { title: 'Items Sold', dataIndex: 'total_items_sold', key: 'total_items_sold' },
    { title: 'Taxable Amount', dataIndex: 'taxable_amount', key: 'taxable_amount', render: v => `₹${Number(v).toFixed(2)}` },
    { title: 'GST Collected', dataIndex: 'total_tax_collected', key: 'total_tax_collected', render: v => <Text strong style={{ color: '#722ed1' }}>₹{Number(v).toFixed(2)}</Text> },
    { title: 'Gross Sales', dataIndex: 'gross_sales', key: 'gross_sales', render: v => `₹${Number(v).toFixed(2)}` }
  ];

  const profitColumns = [
    { title: 'Product', dataIndex: 'product_name', key: 'product_name', render: v => <Text strong>{v}</Text> },
    { title: 'MRP', dataIndex: 'mrp', key: 'mrp', render: v => `₹${v}` },
    { title: 'Selling Price', dataIndex: 'selling_price', key: 'selling_price', render: v => `₹${v}` },
    { title: 'Cost Price', dataIndex: 'cost_price', key: 'cost_price', render: v => `₹${v || 0}` },
    { title: 'Profit / Unit', dataIndex: 'profit_per_unit', key: 'profit_per_unit', render: v => <Text style={{ color: Number(v) >= 0 ? '#52c41a' : '#ff4d4f' }}>₹{v}</Text> },
    { title: 'Margin %', dataIndex: 'margin_percentage', key: 'margin_percentage', render: v => <Progress percent={Math.max(0, Math.min(100, Number(v)))} size="small" status={Number(v) > 20 ? 'active' : 'normal'} /> },
    { title: 'Total Profit', dataIndex: 'total_profit_generated', key: 'total_profit_generated', render: v => <Text strong style={{ color: '#52c41a' }}>₹{v}</Text> }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Title level={3} style={{ margin: 0 }}>Business Reports & ERP Analytics</Title>
          <Text type="secondary">Real-time financial, inventory, sales, customer, and marketing analytics</Text>
        </div>
        <Select value={period} onChange={setPeriod} style={{ width: 160 }}>
          <Select.Option value="7days">Last 7 Days</Select.Option>
          <Select.Option value="30days">Last 30 Days</Select.Option>
          <Select.Option value="90days">Last 90 Days</Select.Option>
          <Select.Option value="1year">Last 1 Year</Select.Option>
        </Select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <Row gutter={16} className="mb-4">
            <Col xs={12} md={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #1890ff' }}>
                <Statistic 
                  title="Total Revenue" 
                  value={salesSummary.total_revenue || 0} 
                  prefix={<DollarOutlined />} 
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #52c41a' }}>
                <Statistic 
                  title="Total Orders" 
                  value={salesSummary.total_orders || 0} 
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #722ed1' }}>
                <Statistic 
                  title="Avg Order Value (AOV)" 
                  value={salesSummary.average_order_value || 0} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card style={{ borderRadius: 12, borderTop: '4px solid #faad14' }}>
                <Statistic 
                  title="Total GST Collected" 
                  value={salesSummary.total_tax || 0} 
                  prefix="₹" 
                  precision={2}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Tabs 
            type="card"
            items={[
              {
                key: 'sales',
                label: <span><LineChartOutlined /> Sales & Performance</span>,
                children: (
                  <div>
                    <Row gutter={16} className="mb-4">
                      <Col span={12}>
                        <Card title="Sales by Category" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={[
                              { title: 'Category', dataIndex: 'category_name', render: v => <Text strong>{v}</Text> },
                              { title: 'Orders', dataIndex: 'total_orders' },
                              { title: 'Items Sold', dataIndex: 'items_sold' },
                              { title: 'Revenue', dataIndex: 'total_revenue', render: v => `₹${v}` }
                            ]}
                            dataSource={catBrandData.byCategory.map((c, i) => ({ ...c, key: i }))}
                            pagination={{ pageSize: 5 }}
                            size="small"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="Sales by Brand" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={[
                              { title: 'Brand', dataIndex: 'brand_name', render: v => <Text strong>{v}</Text> },
                              { title: 'Orders', dataIndex: 'total_orders' },
                              { title: 'Items Sold', dataIndex: 'items_sold' },
                              { title: 'Revenue', dataIndex: 'total_revenue', render: v => `₹${v}` }
                            ]}
                            dataSource={catBrandData.byBrand.map((b, i) => ({ ...b, key: i }))}
                            pagination={{ pageSize: 5 }}
                            size="small"
                          />
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Card title="🔥 Top Best-Selling Products" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={topProductColumns}
                            dataSource={prodPerfData.topProducts.map((p, i) => ({ ...p, key: i }))}
                            pagination={false}
                            size="small"
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="🧊 Slow-Moving / Dead Stock Items" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={slowMovingColumns}
                            dataSource={prodPerfData.slowMoving.map((p, i) => ({ ...p, key: i }))}
                            pagination={false}
                            size="small"
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )
              },
              {
                key: 'inventory',
                label: <span><WarningOutlined /> Inventory & Stock Valuation</span>,
                children: (
                  <div>
                    <Row gutter={16} className="mb-4">
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#f6ffed', borderColor: '#b7eb8f' }}>
                          <Statistic title="Total Products in Inventory" value={invData.valuation.total_products || 0} />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#e6f7ff', borderColor: '#91d5ff' }}>
                          <Statistic title="Total Stock Units Available" value={invData.valuation.total_stock_units || 0} suffix="units" />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#fff7e6', borderColor: '#ffd591' }}>
                          <Statistic title="Total Inventory Retail Value" value={invData.valuation.total_selling_value || 0} prefix="₹" precision={2} />
                        </Card>
                      </Col>
                    </Row>

                    <Card title="⚠️ Low Stock & Reorder Alert List" style={{ borderRadius: 12 }}>
                      <Table 
                        columns={[
                          { title: 'Product', dataIndex: 'product_name', render: v => <Text strong>{v}</Text> },
                          { title: 'Category', dataIndex: 'category_name', render: v => <Tag>{v || 'N/A'}</Tag> },
                          { title: 'Available Stock', dataIndex: 'available_qty', render: v => <Tag color="red">{v} left</Tag> },
                          { title: 'Reserved Stock', dataIndex: 'reserved_qty', render: v => `${v} reserved` },
                          { title: 'Reorder Threshold', dataIndex: 'low_stock_threshold', render: v => `${v} units` }
                        ]}
                        dataSource={invData.lowStock.map((item, idx) => ({ ...item, key: idx }))}
                        pagination={{ pageSize: 10 }}
                      />
                    </Card>
                  </div>
                )
              },
              {
                key: 'tax',
                label: <span><FileTextOutlined /> Tax & GST Filing Summary</span>,
                children: (
                  <Card title="GST / HSN-wise Sales & Tax Breakdown" style={{ borderRadius: 12 }}>
                    <Alert 
                      message="GST Filing Summary" 
                      description="Tax collected is automatically aggregated by HSN code and GST percentage rate for filing GSTR-1 & GSTR-3B."
                      type="info" 
                      showIcon 
                      className="mb-3"
                    />
                    <Table 
                      columns={taxColumns}
                      dataSource={taxData.map((t, idx) => ({ ...t, key: idx }))}
                      pagination={false}
                    />
                  </Card>
                )
              },
              {
                key: 'margins',
                label: <span><PercentageOutlined /> Profit & Margin Analysis</span>,
                children: (
                  <Card title="Product-wise Profit & Gross Margin Breakdown" style={{ borderRadius: 12 }}>
                    <Table 
                      columns={profitColumns}
                      dataSource={profitData.map((m, idx) => ({ ...m, key: idx }))}
                      pagination={{ pageSize: 10 }}
                    />
                  </Card>
                )
              },
              {
                key: 'customers',
                label: <span><UserOutlined /> Customer Insights & CLV</span>,
                children: (
                  <div>
                    <Row gutter={16} className="mb-4">
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#e6f7ff' }}>
                          <Statistic title="Total Registered Customers" value={customerData.ratio.total_customers || 0} />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#f6ffed' }}>
                          <Statistic title="Repeat Customers" value={customerData.ratio.repeat_customers || 0} valueStyle={{ color: '#52c41a' }} />
                        </Card>
                      </Col>
                      <Col span={8}>
                        <Card style={{ borderRadius: 12, background: '#fff2e8' }}>
                          <Statistic title="One-Time Buyers" value={customerData.ratio.one_time_customers || 0} valueStyle={{ color: '#fa8c16' }} />
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={14}>
                        <Card title="🏆 Top Customers by Spend (Customer Lifetime Value)" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={[
                              { title: 'Customer', dataIndex: 'customer_name', render: v => <Text strong>{v}</Text> },
                              { title: 'Mobile', dataIndex: 'mobile' },
                              { title: 'Orders', dataIndex: 'total_orders' },
                              { title: 'Loyalty Points', dataIndex: 'loyalty_points', render: v => <Tag color="gold">{v} pts</Tag> },
                              { title: 'Total Spend', dataIndex: 'total_spend', render: v => <Text strong style={{ color: '#52c41a' }}>₹{v}</Text> }
                            ]}
                            dataSource={customerData.topCustomers.map((c, i) => ({ ...c, key: i }))}
                            pagination={false}
                            size="small"
                          />
                        </Card>
                      </Col>
                      <Col span={10}>
                        <Card title="💤 Inactive Customers (No orders in >30 days)" style={{ borderRadius: 12 }}>
                          <Table 
                            columns={[
                              { title: 'Customer', dataIndex: 'customer_name' },
                              { title: 'Mobile', dataIndex: 'mobile' },
                              { title: 'Days Inactive', dataIndex: 'days_inactive', render: v => <Tag color="volcano">{v} days ago</Tag> }
                            ]}
                            dataSource={customerData.inactiveCustomers.map((c, i) => ({ ...c, key: i }))}
                            pagination={false}
                            size="small"
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )
              },
              {
                key: 'marketing',
                label: <span><TagOutlined /> Coupons & Abandoned Carts</span>,
                children: (
                  <Row gutter={16}>
                    <Col span={14}>
                      <Card title="🛒 Abandoned Carts Analytics" style={{ borderRadius: 12 }}>
                        <Table 
                          columns={[
                            { title: 'Customer', dataIndex: 'customer_name', render: v => <Text strong>{v}</Text> },
                            { title: 'Mobile', dataIndex: 'mobile' },
                            { title: 'Items in Cart', dataIndex: 'item_count' },
                            { title: 'Cart Value', dataIndex: 'estimated_cart_value', render: v => <Text strong style={{ color: '#1890ff' }}>₹{v}</Text> },
                            { title: 'Created At', dataIndex: 'cart_created_at', render: v => new Date(v).toLocaleDateString() }
                          ]}
                          dataSource={cartData.map((c, i) => ({ ...c, key: i }))}
                          pagination={{ pageSize: 5 }}
                          size="small"
                        />
                      </Card>
                    </Col>
                    <Col span={10}>
                      <Card title="🎟️ Coupon Usage Performance" style={{ borderRadius: 12 }}>
                        <Table 
                          columns={[
                            { title: 'Code', dataIndex: 'code', render: v => <Tag color="blue">{v}</Tag> },
                            { title: 'Value', dataIndex: 'discount_value', render: (v, r) => r.discount_type === 'percentage' ? `${v}%` : `₹${v}` },
                            { title: 'Used / Limit', render: (_, r) => `${r.used_count} / ${r.usage_limit}` },
                            { title: 'Status', dataIndex: 'is_active', render: v => <Tag color={v ? 'green' : 'red'}>{v ? 'Active' : 'Expired'}</Tag> }
                          ]}
                          dataSource={couponData.map((c, i) => ({ ...c, key: i }))}
                          pagination={false}
                          size="small"
                        />
                      </Card>
                    </Col>
                  </Row>
                )
              }
            ]}
          />
        </>
      )}
    </div>
  );
};

export default AdminReports;