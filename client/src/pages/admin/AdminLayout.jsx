import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { DashboardOutlined, ShoppingOutlined, AppstoreOutlined, TagsOutlined, TeamOutlined, SettingOutlined, BarChartOutlined, ShopOutlined, InboxOutlined, PictureOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
const {
  Sider,
  Content
} = Layout;
const {
  Text
} = Typography;
const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [{
    key: '/admin',
    icon: <DashboardOutlined />,
    label: <Link to="/admin">Dashboard</Link>
  }, {
    key: '/admin/products',
    icon: <ShoppingOutlined />,
    label: <Link to="/admin/products">Products</Link>
  }, {
    key: '/admin/categories',
    icon: <AppstoreOutlined />,
    label: <Link to="/admin/categories">Categories</Link>
  }, {
    key: '/admin/brands',
    icon: <TagsOutlined />,
    label: <Link to="/admin/brands">Brands</Link>
  }, {
    key: '/admin/orders',
    icon: <ShopOutlined />,
    label: <Link to="/admin/orders">Orders</Link>
  }, {
    key: '/admin/inventory',
    icon: <InboxOutlined />,
    label: <Link to="/admin/inventory">Inventory</Link>
  }, {
    key: '/admin/customers',
    icon: <TeamOutlined />,
    label: <Link to="/admin/customers">Customers</Link>
  }, {
    key: '/admin/reports',
    icon: <BarChartOutlined />,
    label: <Link to="/admin/reports">Reports</Link>
  }, {
    key: '/admin/banners',
    icon: <PictureOutlined />,
    label: <Link to="/admin/banners">Banners & Offers</Link>
  }, {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: <Link to="/admin/settings">Settings</Link>
  }, {
    key: 'logout',
    icon: <LogoutOutlined style={{ color: '#ff4d4f' }} />,
    label: <span style={{ color: '#ff4d4f', fontWeight: 600 }}>Logout</span>
  }];
  return <Layout style={{
    height: '100vh',
    overflow: 'hidden'
  }}>
      <Sider 
        width={250} 
        style={{ 
          background: '#001529',
          height: '100vh',
          overflowY: 'auto'
        }} 
        breakpoint="lg" 
        collapsedWidth="80"
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
      >
        <div style={{
        padding: '20px 10px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
          <Link to="/admin" style={{
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}>
            <Text style={{
            color: '#fff',
            fontSize: collapsed ? '1.5rem' : '1.2rem',
            fontWeight: 'bold'
          }}>
            {collapsed ? '🛒' : '🛒 Admin Panel'}
          </Text>
          </Link>
        </div>
        <Menu 
          mode="inline" 
          theme="dark" 
          selectedKeys={[location.pathname]} 
          items={menuItems} 
          onClick={handleMenuClick}
          style={{
            borderRight: 'none',
            marginTop: 8
          }} 
        />
        {!collapsed && (
          <div style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            textAlign: 'center'
          }}>
            <Link to="/">
              <Text style={{
              color: 'rgba(255,255,255,0.45)',
              fontSize: '0.8rem'
            }}>← Back to Store</Text>
            </Link>
          </div>
        )}
      </Sider>
      <Content style={{
      padding: 24,
      background: '#f0f2f5',
      overflow: 'auto'
    }}>
        <Outlet />
      </Content>
    </Layout>;
};
export default AdminLayout;