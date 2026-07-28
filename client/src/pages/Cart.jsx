import { useState, useEffect } from 'react';
import { Table, InputNumber, Button, Typography, Card, Divider, Input, Tag, Empty, Spin, message } from 'antd';
import { DeleteOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem, getSettings } from '../services/api';
import { useAuthModal } from '../context/AuthModalContext';

const {
  Title,
  Text
} = Typography;

const Cart = () => {
  const navigate = useNavigate();
  const { openAuthDrawer } = useAuthModal();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    default_tax: 5,
    free_delivery_threshold: 500,
    delivery_charge: 40,
  });

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getCart(user.id);
      const items = (res.data.items || []).map(item => ({
        key: item.cart_item_id,
        cart_item_id: item.cart_item_id,
        product_id: item.product_id,
        name: item.product_name,
        price: Number(item.selling_price),
        qty: Number(item.qty),
        image: item.image_url,
        size: item.size
      }));
      setCartItems(items);
    } catch (err) {
      message.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    getSettings().then(res => {
      if (res.data) {
        setStoreSettings({
          default_tax: Number(res.data.default_tax || 5),
          free_delivery_threshold: Number(res.data.free_delivery_threshold || 500),
          delivery_charge: Number(res.data.delivery_charge || 40),
        });
      }
    }).catch(() => {});
  }, []);

  const updateQty = async (key, qty) => {
    try {
      await updateCartItem(key, qty);
      setCartItems(items =>
        items.map(item => (item.key === key ? { ...item, qty } : item))
      );
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      message.error('Failed to update quantity');
    }
  };

  const removeItem = async key => {
    try {
      await removeCartItem(key);
      setCartItems(items => items.filter(item => item.key !== key));
      message.success('Item removed from cart');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      message.error('Failed to remove item');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * (storeSettings.default_tax / 100));
  const delivery = subtotal > storeSettings.free_delivery_threshold ? 0 : storeSettings.delivery_charge;
  const total = subtotal + tax + delivery;

  const columns = [{
    title: 'Product',
    dataIndex: 'name',
    render: (name, record) => <div className="d-flex align-items-center gap-3">
          {record.image ? (
            <img src={record.image} alt={name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{
              width: 60,
              height: 60,
              background: '#f0f0f0',
              borderRadius: 8
            }} />
          )}
          <div>
            <Text strong>{name}</Text>
            {record.size && <div style={{ fontSize: '0.85rem', color: '#8c8c8c', marginTop: 2 }}>Size: {record.size}</div>}
          </div>
        </div>
  }, {
    title: 'Price',
    dataIndex: 'price',
    render: p => <Text>₹{p}</Text>
  }, {
    title: 'Quantity',
    dataIndex: 'qty',
    render: (qty, record) => <InputNumber min={1} max={99} value={qty} onChange={v => updateQty(record.key, v || 1)} />
  }, {
    title: 'Total',
    render: (_, record) => <Text strong>₹{record.price * record.qty}</Text>
  }, {
    title: '',
    render: (_, record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
  }];

  if (!user) {
    return <div className="d-flex flex-column align-items-center justify-content-center" style={{
      minHeight: 'calc(100vh - 64px)'
    }}>
        <Empty description="You must be logged in to view your cart" />
        <Button type="primary" size="large" className="mt-3" icon={<UserOutlined />} onClick={() => openAuthDrawer({ message: 'Log in to view and manage your shopping cart' })}>Login Now</Button>
      </div>;
  }

  if (loading) {
    return <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  }

  if (cartItems.length === 0) {
    return <div className="d-flex flex-column align-items-center justify-content-center" style={{
      minHeight: 'calc(100vh - 64px)'
    }}>
        <Empty description="Your cart is empty" />
        <Link to="/products"><Button type="primary" size="large" className="mt-3" icon={<ShoppingOutlined />}>Continue Shopping</Button></Link>
      </div>;
  }

  return <div style={{
    padding: '20px 50px'
  }}>
      <Title level={2}>Shopping Cart</Title>
      <div className="row">
        <div className="col-md-8">
          <Table columns={columns} dataSource={cartItems} pagination={false} />
        </div>
        <div className="col-md-4">
          <Card style={{
          borderRadius: 12,
          position: 'sticky',
          top: 80
        }}>
            <Title level={4}>Order Summary</Title>
            <Divider />
            <div className="d-flex justify-content-between mb-2"><Text>Subtotal</Text><Text>₹{subtotal}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Tax ({storeSettings.default_tax}%)</Text><Text>₹{tax}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Delivery</Text>{delivery === 0 ? <Tag color="green">FREE</Tag> : <Text>₹{delivery}</Text>}</div>
            <Divider />
            <div className="d-flex justify-content-between mb-3"><Title level={4} style={{
              margin: 0
            }}>Total</Title><Title level={4} style={{
              margin: 0,
              color: '#1890ff'
            }}>₹{total}</Title></div>
            <div className="mb-3 text-center p-2" style={{ background: '#fafafa', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>🏷️ Coupon & Promo Codes <Tag color="blue">Upcoming Feature</Tag></Text>
            </div>
            <Link to="/checkout">
              <Button type="primary" size="large" block shape="round" style={{
              height: 48
            }}>Proceed to Checkout</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>;
};
export default Cart;