import { Layout, Button, Space, Badge, Input, Dropdown, Avatar, Typography, AutoComplete, Modal, Divider } from 'antd';
import { ShoppingCart, User, Search, MapPin, Phone, ChevronDown, Menu as MenuIcon, LogOut, Package, Heart, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCategories, getProducts, getProductSuggestions, recordSearch, getSettings, getCustomerById } from '../services/api';
import { categoryEmojis } from '../utils/constants';

import { useAuthModal } from '../context/AuthModalContext';

const {
  Header
} = Layout;
const {
  Text,
  Paragraph
} = Typography;
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { openAuthDrawer } = useAuthModal();
  const [categories, setCategories] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [storeSettings, setStoreSettings] = useState({
    city: 'Bangalore',
    pincode: '560034',
    phone: '+91 98765 43210',
    email: 'support@hypermarket.com',
    address: '123, MG Road, Koramangala'
  });

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;
    getCategories().then(res => setCategories(res.data || [])).catch(() => { });

    // Fetch store settings
    getSettings().then(res => {
      if (res.data) setStoreSettings(res.data);
    }).catch(() => {});

    // Fetch default shipping address
    const uStr = sessionStorage.getItem('user');
    const currentUser = uStr ? JSON.parse(uStr) : null;
    if (currentUser) {
      getCustomerById(currentUser.id).then(res => {
        const addrs = res.data.addresses || [];
        const defAddr = addrs.find(a => a.is_default?.data ? a.is_default.data[0] === 1 : a.is_default === 1) || addrs[0];
        if (defAddr) {
          setDeliveryAddress(`${defAddr.city} ${defAddr.pincode}`);
        }
      }).catch(() => {});
    }

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
      const res = await getProductSuggestions(value);
      const { suggestions, products } = res.data;
      
      const options = [];
      
      // Add keyword / category suggestions first
      if (suggestions && suggestions.length > 0) {
        suggestions.forEach((sug) => {
          options.push({
            value: sug,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                <Search size={14} color="#8c8c8c" />
                <span>{sug}</span>
              </div>
            )
          });
        });
      }

      // Add direct product suggestions second, with a divider/header
      if (products && products.length > 0) {
        options.push({
          value: value, // prevent empty select issues
          disabled: true,
          label: (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '8px', marginTop: '4px', marginBottom: '4px' }}>
              <Text type="secondary" style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Products</Text>
            </div>
          )
        });

        products.forEach(prod => {
          options.push({
            value: prod.name,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
                <span style={{ fontWeight: 500 }}>{prod.name}</span>
                <span style={{ fontSize: '11px', color: '#1890ff' }}>in {prod.category}</span>
              </div>
            ),
            productId: prod.id
          });
        });
      }

      setSearchOptions(options);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (value, option) => {
    if (option.productId) {
      navigate(`/product/${option.productId}`);
    } else {
      recordSearch(value).catch(() => {});
      
      // Check if suggestion contains category mapping: e.g. "term in CategoryName"
      const inMatch = value.match(/(.+) in (.+)/);
      if (inMatch) {
        const query = inMatch[1].trim();
        const categoryName = inMatch[2].trim();
        const matchedCat = categories.find(c => c.category_name === categoryName);
        if (matchedCat) {
          navigate(`/products?search=${encodeURIComponent(query)}&category=${matchedCat.category_id}`);
          return;
        }
      }
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const handleSearch = (value) => {
    if (value.trim()) {
      recordSearch(value.trim()).catch(() => {});
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
        <span className="d-flex align-items-center gap-1">
          <MapPin size={14} color="#1890ff" /> 
          Deliver to: <Text strong>{deliveryAddress || `${storeSettings.city} ${storeSettings.pincode || ''}`}</Text>
        </span>
        <span className="d-flex align-items-center gap-1">
          <Phone size={14} color="#1890ff" /> 
          Call Us: <a href={`tel:${storeSettings.phone}`} style={{ color: 'inherit', fontWeight: 600 }}>{storeSettings.phone}</a>
        </span>
      </Space>
      <Space size="large">
        <Link to="/orders" style={{
          color: '#666'
        }}>Track Order</Link>
        <span onClick={() => setHelpOpen(true)} style={{
          color: '#666',
          cursor: 'pointer'
        }}>Help Center</span>
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
            enterButton={<Search size={20} />}
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
        {/* <Link to="/" style={{
          color: '#f5222d',
          fontWeight: 600
        }}>% Offers</Link> */}

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
        </Dropdown> : (
          <Button
            type="primary"
            shape="round"
            icon={<User size={18} />}
            onClick={() => openAuthDrawer({ message: 'Log in to your Hypermarket account' })}
            style={{
              height: 40,
              paddingInline: 24,
              fontWeight: 600
            }}
          >
            Login
          </Button>
        )}
      </Space>
    </Header>
    
    <Modal
      title={<span style={{ fontWeight: 'bold', fontSize: '18px' }}>📞 Help & Support Center</span>}
      open={helpOpen}
      onCancel={() => setHelpOpen(false)}
      footer={[
        <Button key="close" type="primary" onClick={() => setHelpOpen(false)}>Close</Button>
      ]}
      width={480}
    >
      <div style={{ padding: '10px 0' }}>
        <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
          Welcome to the <strong>{storeSettings.store_name}</strong> Help Desk. We're available to assist you with your orders, refunds, and delivery inquiries.
        </Paragraph>
        <Divider style={{ margin: '15px 0' }} />
        <div className="mb-3">
          <Text type="secondary" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Support Contact Number</Text>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            <a href={`tel:${storeSettings.phone}`}>{storeSettings.phone}</a>
          </Text>
        </div>
        <div className="mb-3">
          <Text type="secondary" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Support Address</Text>
          <Text strong style={{ fontSize: '15px' }}>
            <a href={`mailto:${storeSettings.email}`} style={{ color: 'inherit' }}>{storeSettings.email}</a>
          </Text>
        </div>
        <div>
          <Text type="secondary" style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Store Address</Text>
          <Text strong style={{ fontSize: '14px', lineHeight: '1.5', display: 'block', marginTop: 4 }}>
            {storeSettings.address}, {storeSettings.city}, {storeSettings.state} - {storeSettings.pincode}
          </Text>
        </div>
      </div>
    </Modal>
  </>;
};
export default Navbar;