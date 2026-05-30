import { useState } from 'react';
import { Table, InputNumber, Button, Typography, Card, Divider, Input, Tag, Empty } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

interface CartItem {
  key: number;
  name: string;
  price: number;
  qty: number;
  image: string | null;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { key: 1, name: 'Fresh Organic Apples', price: 120, qty: 2, image: null },
    { key: 2, name: 'Organic Milk 1L', price: 65, qty: 1, image: null },
    { key: 3, name: 'Whole Wheat Bread', price: 45, qty: 3, image: null },
  ]);

  const updateQty = (key: number, qty: number) => {
    setCartItems(items => items.map(item => item.key === key ? { ...item, qty } : item));
  };

  const removeItem = (key: number) => {
    setCartItems(items => items.filter(item => item.key !== key));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + tax + delivery;

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      render: (name: string) => (
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: 8 }} />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    { title: 'Price', dataIndex: 'price', render: (p: number) => <Text>₹{p}</Text> },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      render: (qty: number, record: CartItem) => (
        <InputNumber min={1} max={99} value={qty} onChange={(v) => updateQty(record.key, v || 1)} />
      ),
    },
    {
      title: 'Total',
      render: (_: unknown, record: CartItem) => <Text strong>₹{record.price * record.qty}</Text>,
    },
    {
      title: '',
      render: (_: unknown, record: CartItem) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(record.key)} />
      ),
    },
  ];

  if (cartItems.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Empty description="Your cart is empty" />
        <Link to="/products"><Button type="primary" size="large" className="mt-3" icon={<ShoppingOutlined />}>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 50px' }}>
      <Title level={2}>Shopping Cart</Title>
      <div className="row">
        <div className="col-md-8">
          <Table columns={columns} dataSource={cartItems} pagination={false} />
        </div>
        <div className="col-md-4">
          <Card style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
            <Title level={4}>Order Summary</Title>
            <Divider />
            <div className="d-flex justify-content-between mb-2"><Text>Subtotal</Text><Text>₹{subtotal}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Tax (5%)</Text><Text>₹{tax}</Text></div>
            <div className="d-flex justify-content-between mb-2"><Text>Delivery</Text>{delivery === 0 ? <Tag color="green">FREE</Tag> : <Text>₹{delivery}</Text>}</div>
            <Divider />
            <div className="d-flex justify-content-between mb-3"><Title level={4} style={{ margin: 0 }}>Total</Title><Title level={4} style={{ margin: 0, color: '#1890ff' }}>₹{total}</Title></div>
            <Input.Search placeholder="Coupon Code" enterButton="Apply" className="mb-3" />
            <Link to="/checkout">
              <Button type="primary" size="large" block shape="round" style={{ height: 48 }}>Proceed to Checkout</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
