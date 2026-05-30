import { Layout, Button, Space, Badge, Input, Dropdown, Avatar, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { ShoppingCart, User, Search, MapPin, Phone, ChevronDown, Menu as MenuIcon, LogOut, Package, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories } from '../services/api';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  const categoryEmojis: Record<string, string> = {
    'Fruits & Vegetables': '🥬', 'Dairy & Eggs': '🥛', 'Bakery': '🍞', 'Meat & Seafood': '🥩',
    'Beverages': '🧃', 'Snacks': '🍿', 'Groceries & Staples': '🛒', 'Personal Care': '🧴', 'Household': '🏠',
  };

  const categoryMenu: MenuProps = {
    items: [
      ...categories.slice(0, 8).map(c => ({
        key: String(c.category_id),
        label: <Link to={`/products?category=${c.category_id}`}>{categoryEmojis[c.category_name] || '📦'} {c.category_name}</Link>
      })),
      { type: 'divider' },
      { key: 'all', label: <Link to="/products">View All Categories</Link> },
    ]
  };

  const profileMenu: MenuProps = {
    items: [
      { key: 'profile', icon: <User size={16} />, label: <Link to="/profile">My Profile</Link> },
      { key: 'orders', icon: <Package size={16} />, label: <Link to="/orders">My Orders</Link> },
      { key: 'wishlist', icon: <Heart size={16} />, label: <Link to="/profile">Wishlist</Link> },
      { type: 'divider' },
      { key: 'logout', icon: <LogOut size={16} />, label: 'Logout', onClick: handleLogout, danger: true },
    ]
  };

  return (
    <>
      {/* Top Bar - Very thin bar for extra info */}
      <div style={{ background: '#f5f5f5', padding: '4px 50px', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
        <Space size="large">
          <span className="d-flex align-items-center gap-1"><MapPin size={14} color="#1890ff" /> Deliver to: <Text strong>Bangalore 560034</Text></span>
          <span className="d-flex align-items-center gap-1"><Phone size={14} color="#1890ff" /> Call Us: +91 98765 43210</span>
        </Space>
        <Space size="large">
          <Link to="/orders" style={{ color: '#666' }}>Track Order</Link>
          <Link to="/" style={{ color: '#666' }}>Help Center</Link>
        </Space>
      </div>

      {/* Main Navbar */}
      <Header className="d-flex align-items-center justify-content-between sticky-top" style={{ padding: '0 50px', background: '#ffffff', height: '76px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', zIndex: 100 }}>
        
        {/* Logo */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/" style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1890ff', textDecoration: 'none', letterSpacing: '-0.5px' }}>
            <span style={{ fontSize: '2rem', verticalAlign: 'middle', marginRight: '6px' }}>🛒</span>
            HYPERMARKET
          </Link>
          
          <Dropdown menu={categoryMenu} trigger={['click']}>
            <Button type="text" className="d-flex align-items-center gap-2" style={{ fontWeight: 600, height: 40, borderRadius: 20, background: '#f0f5ff', color: '#1890ff' }}>
              <MenuIcon size={18} /> Categories <ChevronDown size={16} />
            </Button>
          </Dropdown>
        </div>

        {/* Search Bar - Center */}
        <div style={{ flex: 1, maxWidth: '500px', margin: '0 40px' }}>
          <Input.Search 
            placeholder="Search for groceries, fruits, veggies..." 
            allowClear 
            enterButton={<Button type="primary" style={{ background: '#1890ff', width: '60px' }}><Search size={20} /></Button>}
            size="large"
            style={{ 
              borderRadius: '24px', 
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }} 
          />
        </div>

        {/* Right Actions */}
        <Space size="large" align="center">
          <Link to="/products" style={{ color: location.pathname === '/products' ? '#1890ff' : '#333', fontWeight: 600 }}>All Products</Link>
          <Link to="/" style={{ color: '#f5222d', fontWeight: 600 }}>% Offers</Link>

          <div style={{ width: '1px', height: '24px', background: '#e8e8e8', margin: '0 8px' }}></div>

          <Link to="/cart">
            <Badge count={3} size="small" color="#f5222d" offset={[-4, 4]}>
              <Button type="text" shape="circle" style={{ width: 44, height: 44, background: '#f5f5f5' }}>
                <ShoppingCart size={22} color="#333" />
              </Button>
            </Badge>
          </Link>

          {user ? (
            <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
              <div style={{ cursor: 'pointer', padding: '4px', borderRadius: '30px', border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: '8px', background: '#fff' }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<User size={18} />} />
                <Text strong style={{ marginRight: '8px' }}>{user.name.split(' ')[0]}</Text>
                <ChevronDown size={14} style={{ marginRight: '6px' }} />
              </div>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary" shape="round" icon={<User size={18} />} style={{ height: 40, paddingInline: 24, fontWeight: 600 }}>
                Login
              </Button>
            </Link>
          )}
        </Space>
      </Header>
    </>
  );
};

export default Navbar;
