import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Tag, InputNumber, Divider, Breadcrumb, Tabs, Spin, message } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined, CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';
import { getProductById, addToCart } from '../services/api';
import { categoryEmojis } from '../utils/constants';
const {
  Title,
  Text,
  Paragraph
} = Typography;
const ProductDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const handleAddToCart = async () => {
    const userString = sessionStorage.getItem('user');
    if (!userString) {
      message.warning('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      const user = JSON.parse(userString);
      await addToCart({
        customer_id: user.id,
        product_id: product.product_id,
        qty: qty
      });
      message.success('Item added to cart!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch {
        message.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);
  if (loading) return <div className="text-center py-5" style={{
    minHeight: '60vh'
  }}><Spin size="large" /></div>;
  if (!product) return <div className="text-center py-5"><Title level={4}>Product not found</Title></div>;
  const displayPrice = product.offer_price || product.selling_price;
  const discount = product.mrp > 0 ? Math.round((product.mrp - displayPrice) / product.mrp * 100) : 0;
  return <div style={{
    padding: '30px 50px',
    background: '#f8f9fa',
    minHeight: '80vh'
  }}>
      <Breadcrumb className="mb-4" items={[{
      title: <Link to="/">Home</Link>
    }, {
      title: <Link to="/products">Products</Link>
    }, {
      title: product.product_name
    }]} />
      <Card style={{
      borderRadius: 16,
      border: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    }}>
        <Row gutter={40}>
          <Col xs={24} md={10}>
            <div style={{
            height: 350,
            background: '#fafafa',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8rem',
            marginBottom: 16,
            overflow: 'hidden'
          }}>
              {product.images && product.images.length > 0 && product.images[activeImage]?.image_url ? (
                <img
                  src={product.images[activeImage].image_url}
                  alt={product.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : product.primary_image ? (
                <img
                  src={product.primary_image}
                  alt={product.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                categoryEmojis[product.category_name] || '📦'
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="d-flex gap-2 justify-content-center flex-wrap mt-2">
                {product.images.map((img, idx) => (
                  <div
                    key={img.image_id || idx}
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      border: activeImage === idx ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      padding: 2,
                      background: '#fff'
                    }}
                  >
                    <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  </div>
                ))}
              </div>
            )}
          </Col>
          <Col xs={24} md={14}>
            <Tag color="blue" className="mb-2">{product.category_name}</Tag>
            <Title level={2} style={{
            marginBottom: 4
          }}>{product.product_name}</Title>
            <div className="d-flex align-items-center gap-2 mb-2">
              {product.brand_name && <Text type="secondary" style={{ fontSize: '1rem' }}>by {product.brand_name}</Text>}
              {product.brand_name && product.size && <Text type="secondary" style={{ fontSize: '1rem' }}>•</Text>}
              {product.size && <Text type="secondary" style={{ fontSize: '1rem' }}>{product.size}</Text>}
            </div>

            <Divider />

            <div className="d-flex align-items-baseline gap-3 mb-2">
              <Text strong style={{
              fontSize: '2rem',
              color: '#1890ff'
            }}>₹{displayPrice}</Text>
              {discount > 0 && <>
                  <Text delete type="secondary" style={{
                fontSize: '1.2rem'
              }}>₹{product.mrp}</Text>
                  <Tag color="red" style={{
                fontSize: '0.9rem',
                padding: '2px 12px'
              }}>{discount}% OFF</Tag>
                </>}
            </div>
            {product.tax_percent > 0 && <Text type="secondary" style={{
            fontSize: '0.85rem'
          }}>Inclusive of {product.tax_percent}% tax</Text>}

            <div className="mt-3 mb-3">
              {product.stock_qty > 0 ? <Tag icon={<CheckCircleOutlined />} color="success" style={{
              padding: '4px 12px'
            }}>In Stock ({product.stock_qty} available)</Tag> : <Tag color="error" style={{
              padding: '4px 12px'
            }}>Out of Stock</Tag>}
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <Text>Quantity:</Text>
              <InputNumber min={1} max={product.stock_qty || 1} value={qty} onChange={v => setQty(v || 1)} />
            </div>

            <div className="d-flex gap-3 mb-4">
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} shape="round" style={{
              height: 48,
              paddingInline: 32
            }} onClick={handleAddToCart} loading={adding} disabled={product.stock_qty === 0}>
                Add to Cart — ₹{displayPrice * qty}
              </Button>
              <Button size="large" icon={<HeartOutlined />} shape="round" style={{
              height: 48
            }}>Wishlist</Button>
              <Button size="large" icon={<ShareAltOutlined />} shape="circle" style={{
              height: 48,
              width: 48
            }} />
            </div>

            <Card style={{
            background: '#f0f5ff',
            borderRadius: 12,
            border: 'none'
          }}>
              <div className="d-flex align-items-center gap-3">
                <TruckOutlined style={{
                fontSize: 24,
                color: '#1890ff'
              }} />
                <div>
                  <Text strong>Free Delivery</Text> on orders above ₹500<br />
                  <Text type="secondary" style={{
                  fontSize: '0.85rem'
                }}>Estimated delivery: 2-4 hours</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {product.description && <Card className="mt-4" style={{
      borderRadius: 16,
      border: 'none'
    }}>
          <Tabs items={[{
        key: 'desc',
        label: 'Description',
        children: <Paragraph>{product.description}</Paragraph>
      }, {
        key: 'info',
        label: 'Product Info',
        children: <div>
                {product.unit_name && <div className="mb-2"><Text strong>Unit:</Text> {product.unit_name}</div>}
                {product.size && <div className="mb-2"><Text strong>Size:</Text> {product.size}</div>}
                {product.hsn_code && <div className="mb-2"><Text strong>HSN Code:</Text> {product.hsn_code}</div>}
                <div className="mb-2"><Text strong>Category:</Text> {product.category_name}</div>
                {product.brand_name && <div className="mb-2"><Text strong>Brand:</Text> {product.brand_name}</div>}
              </div>
      }]} />
        </Card>}
    </div>;
};
export default ProductDetail;