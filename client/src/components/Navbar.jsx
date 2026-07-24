import { Layout, Button, Space, Badge, Input, Dropdown, Avatar, Typography, AutoComplete } from 'antd';
import { ShoppingCart, User, Search, MapPin, Phone, ChevronDown, Menu as MenuIcon, LogOut, Package, Heart, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories, getProducts } from '../services/api';
import { categoryEmojis } from '../utils/constants';

const {
  Header
} = Layout;
const {
  Text
} = Typography;
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [cartCount, setCartCount] = useState(0);

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    getCategories().then(res => setCategories(res.data || [])).catch(() => { });

    const updateCart = () => {
      const uStr = sessionStorage.getItem('user');
      const currentUser = uStr ? JSON.parse(uStr) : null;
      if (currentUser) {
        import('../services/api').then(({ getCart }) => {
          getCart(currentUser.id).then(res => {
            const items = res.data?.items || [];
            const count = items.reduce((sum, item) => sum + Number(item.qty), 0);
            setCartCount(count);
          }).catch(() => setCartCount(0));
        });
      } else {
        setCartCount(0);
      }
    };

    updateCart();

    window.addEventListener('cartChange', updateCart);
    return () => {
      window.removeEventListener('cartChange', updateCart);
    };
  }, [location.pathname]);

  // Hide navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearchChange = async (value) => {
    setSearchValue(value);
    if (!value.trim()) {
      setSearchOptions([]);
      return;
    }
    try {
      const res = await getProducts({ search: value, limit: 10 });
      const items = res.data.products || [];
      setSearchOptions(items.map(item => ({
        value: item.product_name,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{item.product_name}</span>
            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>in {item.category_name}</span>
          </div>
        ),
        productId: item.product_id
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (value, option) => {
    if (option.productId) {
      navigate(`/product/${option.productId}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/products?search=${encodeURIComponent(value.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const categoryMenu = {
    items: [...categories.slice(0, 8).map(c => ({
      key: String(c.category_id),
      label: <Link to={`/products?category=${c.category_id}`} style={{
        textDecoration: 'none',
        color: 'inherit'
      }}>{categoryEmojis[c.category_name] || '📦'} {c.category_name}</Link>
    })), {
      type: 'divider'
    }, {
      key: 'all',
      label: <Link to="/products" style={{
        textDecoration: 'none',
        color: 'inherit'
      }}>View All Categories</Link>
    }]
  };
  const profileMenuItems = [{
    key: 'profile',
    icon: <User size={16} />,
    label: <Link to="/profile" style={{
      textDecoration: 'none',
      color: 'inherit'
    }}>My Profile</Link>
  }, {
    key: 'orders',
    icon: <Package size={16} />,
    label: <Link to="/orders" style={{
      textDecoration: 'none',
      color: 'inherit'
    }}>My Orders</Link>
  }, {
    key: 'wishlist',
    icon: <Heart size={16} />,
    label: <Link to="/profile" style={{
      textDecoration: 'none',
      color: 'inherit'
    }}>Wishlist</Link>
  }];

  if (user && user.role === 'admin') {
    profileMenuItems.unshift({
      key: 'dashboard',
      icon: <LayoutDashboard size={16} />,
      label: <Link to="/admin" style={{
        textDecoration: 'none',
        color: 'inherit',
      }}>Dashboard</Link>
    });
  }

  profileMenuItems.push({
    type: 'divider'
  }, {
    key: 'logout',
    icon: <LogOut size={16} />,
    label: 'Logout',
    onClick: handleLogout,
    danger: true
  });

  const profileMenu = {
    items: profileMenuItems
  };
  return <>
    {/* Top Bar - Very thin bar for extra info */}
    <div style={{
      background: '#f5f5f5',
      padding: '4px 50px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '12px'
    }}>
      <Space size="large">
        <span className="d-flex align-items-center gap-1"><MapPin size={14} color="#1890ff" /> Deliver to: <Text strong>Bangalore 560034</Text></span>
        <span className="d-flex align-items-center gap-1"><Phone size={14} color="#1890ff" /> Call Us: +91 98765 43210</span>
      </Space>
      <Space size="large">
        <Link to="/orders" style={{
          color: '#666'
        }}>Track Order</Link>
        <Link to="/" style={{
          color: '#666'
        }}>Help Center</Link>
      </Space>
    </div>

    {/* Main Navbar */}
    <Header className="d-flex align-items-center justify-content-between sticky-top" style={{
      padding: '0 50px',
      background: '#ffffff',
      height: '76px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      zIndex: 100
    }}>

      {/* Logo */}
      <div className="d-flex align-items-center gap-4">
        <Link to="/" style={{
          fontSize: '1.75rem',
          fontWeight: '900',
          color: '#1890ff',
          textDecoration: 'none',
          letterSpacing: '-0.5px'
        }}>
          <span style={{
            fontSize: '2rem',
            verticalAlign: 'middle',
            marginRight: '6px'
          }}>🛒</span>
          Mi MART
        </Link>

        {/* <Dropdown menu={categoryMenu} trigger={['click']}>
          <Button type="text" className="d-flex align-items-center gap-2" style={{
            fontWeight: 600,
            height: 40,
            borderRadius: 20,
            background: '#f0f5ff',
            color: '#1890ff'
          }}>
            <MenuIcon size={18} /> Categories <ChevronDown size={16} />
          </Button>
        </Dropdown> */}
      </div>

      {/* Search Bar - Center */}
      <div style={{
        flex: 1,
        maxWidth: '500px',
        margin: '0 40px'
      }}>
        <AutoComplete
          options={searchOptions}
          onSearch={handleSearchChange}
          onSelect={handleSelect}
          value={searchValue}
          onChange={setSearchValue}
          style={{ width: '100%' }}
        >
          <Input.Search
            className="fk-search-input"
            placeholder="Search for groceries, fruits, veggies..."
            allowClear
            onSearch={handleSearch}
            enterButton={<Button type="primary" style={{ background: '#1890ff', width: '60px' }}><Search size={20} /></Button>}
            size="large"
          />
        </AutoComplete>
      </div>

      {/* Right Actions */}
      <Space size="large" align="center">
        {/* <Link to="/products" style={{
          color: location.pathname === '/products' ? '#1890ff' : '#333',
          fontWeight: 600
        }}>All Products</Link> */}
        <Link to="/" style={{
          color: '#f5222d',
          fontWeight: 600
        }}>% Offers</Link>

        <div style={{
          width: '1px',
          height: '24px',
          background: '#e8e8e8',
          margin: '0 8px'
        }}></div>

        <Link to="/cart">
          <Badge count={cartCount} size="small" color="#f5222d" offset={[-4, 4]}>
            <Button type="text" shape="circle" style={{
              width: 44,
              height: 44,
              background: '#f5f5f5'
            }}>
              <ShoppingCart size={22} color="#333" />
            </Button>
          </Badge>
        </Link>

        {user ? <Dropdown menu={profileMenu} trigger={['click']} placement="bottomRight">
          <div style={{
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '30px',
            border: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fff'
          }}>
            <Avatar style={{
              backgroundColor: '#1890ff'
            }} icon={<User size={18} />} />
            <Text strong style={{
              marginRight: '8px'
            }}>{user.name.split(' ')[0]}</Text>
            <ChevronDown size={14} style={{
              marginRight: '6px'
            }} />
          </div>
        </Dropdown> : <Link to="/login">
          <Button type="primary" shape="round" icon={<User size={18} />} style={{
            height: 40,
            paddingInline: 24,
            fontWeight: 600
          }}>
            Login
          </Button>
        </Link>}
      </Space>
    </Header>
  </>;
};
export default Navbar;