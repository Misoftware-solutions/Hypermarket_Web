import { Layout, Menu, Typography } from 'antd';
import { DashboardOutlined, ShoppingOutlined, AppstoreOutlined, TagsOutlined, TeamOutlined, SettingOutlined, BarChartOutlined, ShopOutlined, InboxOutlined, PictureOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: <Link to="/admin/products">Products</Link> },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: <Link to="/admin/categories">Categories</Link> },
    { key: '/admin/brands', icon: <TagsOutlined />, label: <Link to="/admin/brands">Brands</Link> },
    { key: '/admin/orders', icon: <ShopOutlined />, label: <Link to="/admin/orders">Orders</Link> },
    { key: '/admin/inventory', icon: <InboxOutlined />, label: <Link to="/admin/inventory">Inventory</Link> },
    { key: '/admin/customers', icon: <TeamOutlined />, label: <Link to="/admin/customers">Customers</Link> },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: <Link to="/admin/reports">Reports</Link> },
    { key: '/admin/banners', icon: <PictureOutlined />, label: <Link to="/admin/banners">Banners & Offers</Link> },
    { key: '/admin/settings', icon: <SettingOutlined />, label: <Link to="/admin/settings">Settings</Link> },
  ];

  return (
    <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Sider width={250} style={{ background: '#001529' }} breakpoint="lg" collapsedWidth="80">
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/admin" style={{ textDecoration: 'none' }}>
            <Text style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>🛒 Admin Panel</Text>
          </Link>
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 'none', marginTop: 8 }}
        />
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
          <Link to="/">
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>← Back to Store</Text>
          </Link>
        </div>
      </Sider>
      <Content style={{ padding: 24, background: '#f0f2f5', overflow: 'auto' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayout;
