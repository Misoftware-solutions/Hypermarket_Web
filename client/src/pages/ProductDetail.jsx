import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Button, Tag, InputNumber, Divider, Breadcrumb, Tabs, Spin, message, Rate, Form, Input, List } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, ShareAltOutlined, TruckOutlined } from '@ant-design/icons';
import { getProductById, addToCart, getProductReviews, createProductReview, getProducts } from '../services/api';
import { categoryEmojis } from '../utils/constants';

import { useAuthModal } from '../context/AuthModalContext';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openAuthDrawer } = useAuthModal();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [form] = Form.useForm();

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleAddToCart = async () => {
    const currentSessionUserStr = sessionStorage.getItem('user');
    const currentSessionUser = currentSessionUserStr ? JSON.parse(currentSessionUserStr) : null;
    if (!currentSessionUser) {
      openAuthDrawer({
        message: 'Please log in to add items to your cart.',
        onSuccess: async (loggedInUser) => {
          setAdding(true);
          try {
            await addToCart({
              customer_id: loggedInUser.id,
              product_id: product.product_id,
              qty: qty
            });
            message.success('Item added to cart!');
            window.dispatchEvent(new Event('cartChange'));
          } catch (err) {
            message.error(err.response?.data?.message || 'Failed to add item to cart.');
          } finally {
            setAdding(false);
          }
        }
      });
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        customer_id: currentSessionUser.id,
        product_id: product.product_id,
        qty: qty
      });
      message.success('Item added to cart!');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleAddSimilarToCart = async (similarProdId) => {
    const currentSessionUserStr = sessionStorage.getItem('user');
    const currentSessionUser = currentSessionUserStr ? JSON.parse(currentSessionUserStr) : null;
    if (!currentSessionUser) {
      openAuthDrawer({
        message: 'Please log in to add items to your cart.',
        onSuccess: async (loggedInUser) => {
          try {
            await addToCart({
              customer_id: loggedInUser.id,
              product_id: similarProdId,
              qty: 1
            });
            message.success('Item added to cart!');
            window.dispatchEvent(new Event('cartChange'));
          } catch (err) {
            message.error('Failed to add item to cart.');
          }
        }
      });
      return;
    }
    try {
      await addToCart({
        customer_id: currentSessionUser.id,
        product_id: similarProdId,
        qty: 1
      });
      message.success('Item added to cart!');
      window.dispatchEvent(new Event('cartChange'));
    } catch (err) {
      message.error('Failed to add item to cart.');
    }
  };

  const fetchProductAndReviews = async () => {
    try {
      const prodRes = await getProductById(id);
      setProduct(prodRes.data);
      
      const [reviewsRes, similarRes] = await Promise.all([
        getProductReviews(id).catch(() => ({ data: [] })),
        getProducts({ category: prodRes.data.category_id, limit: 7 }).catch(() => ({ data: { products: [] } }))
      ]);
      setReviews(reviewsRes.data || []);
      const filtered = (similarRes.data.products || []).filter(p => p.product_id !== prodRes.data.product_id);
      setSimilarProducts(filtered.slice(0, 6)); // Display up to 6 similar products
    } catch {
      message.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
    setActiveImage(0); // Reset active image on product switch
  }, [id]);

  const handleReviewSubmit = async (values) => {
    if (!user) {
      message.error('Please login to leave a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      await createProductReview(product.product_id, {
        ...values,
        customer_id: user.id
      });
      message.success('Thank you! Your review has been saved.');
      form.resetFields();
      const reviewsRes = await getProductReviews(id);
      setReviews(reviewsRes.data || []);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="text-center py-5" style={{ minHeight: '60vh' }}><Spin size="large" /></div>;
  if (!product) return <div className="text-center py-5"><Title level={4}>Product not found</Title></div>;

  const displayPrice = product.offer_price || product.selling_price;
  const discount = product.mrp > 0 ? Math.round((product.mrp - displayPrice) / product.mrp * 100) : 0;

  const tabItems = [
    {
      key: 'desc',
      label: 'Description',
      children: <Paragraph style={{ fontSize: '15px', lineHeight: '1.6' }}>{product.description || 'No description available.'}</Paragraph>
    },
    {
      key: 'info',
      label: 'Product Info',
      children: (
        <div>
          {product.unit_name && <div className="mb-2"><Text strong>Unit:</Text> {product.unit_name}</div>}
          {product.size && <div className="mb-2"><Text strong>Size:</Text> {product.size}</div>}
          {product.hsn_code && <div className="mb-2"><Text strong>HSN Code:</Text> {product.hsn_code}</div>}
          <div className="mb-2"><Text strong>Category:</Text> {product.category_name}</div>
          {product.brand_name && <div className="mb-2"><Text strong>Brand:</Text> {product.brand_name}</div>}
        </div>
      )
    },
    {
      key: 'reviews',
      label: `Reviews (${reviews.length})`,
      children: (
        <div>
          <Row gutter={32}>
            <Col xs={24} md={14}>
              <Title level={4} className="mb-3">Customer Reviews</Title>
              {reviews.length === 0 ? (
                <Paragraph type="secondary">No reviews yet for this product. Be the first to review!</Paragraph>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={reviews}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <div className="d-flex justify-content-between align-items-center">
                            <span>
                              <Text strong style={{ fontSize: '15px' }}>{item.title || 'Review'}</Text>
                              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>by {item.customer_name}</div>
                            </span>
                            <span style={{ fontSize: '12px', color: '#bfbfbf' }}>
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        }
                        description={
                          <div>
                            <div className="mb-2"><Rate disabled defaultValue={item.rating} style={{ fontSize: '13px' }} /></div>
                            <Paragraph>{item.review_text}</Paragraph>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Col>
            
            <Col xs={24} md={10}>
              <Card style={{ borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <Title level={4} className="mb-3">Write a Review</Title>
                {user ? (
                  <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
                    <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please select a rating' }]}>
                      <Rate />
                    </Form.Item>
                    <Form.Item name="title" label="Review Title" rules={[{ required: true, message: 'Please enter a title' }]}>
                      <Input placeholder="e.g. Great Quality, Highly Recommend" />
                    </Form.Item>
                    <Form.Item name="review_text" label="Review Feedback" rules={[{ required: true, message: 'Please enter your review feedback' }]}>
                      <Input.TextArea rows={4} placeholder="Write your review details here..." />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={submittingReview} block shape="round" size="large">
                        Submit Review
                      </Button>
                    </Form.Item>
                  </Form>
                ) : (
                  <div className="text-center py-3">
                    <Paragraph type="secondary">Please log in to submit a review for this product.</Paragraph>
                    <Link to="/login">
                      <Button type="primary" shape="round">Login Now</Button>
                    </Link>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '30px 50px', background: '#f8f9fa', minHeight: '80vh' }}>
      <Breadcrumb className="mb-4" items={[
        { title: <Link to="/">Home</Link> },
        { title: <Link to="/products">Products</Link> },
        { title: product.product_name }
      ]} />
      <Card style={{ borderRadius: 16, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
              ) : (
                categoryEmojis[product.category_name] || '📦'
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <Row gutter={8}>
                {product.images.map((img, idx) => (
                  <Col span={6} key={idx}>
                    <div
                      style={{
                        height: 70,
                        border: activeImage === idx ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setActiveImage(idx)}
                    >
                      <img src={img.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
          <Col xs={24} md={14}>
            <span style={{ fontSize: '0.9rem', color: '#1890ff', fontWeight: 600, textTransform: 'uppercase' }}>
              {product.brand_name || 'Generic'}
            </span>
            <Title level={2} style={{ marginTop: 8, marginBottom: 12 }}>{product.product_name}</Title>
            <div className="d-flex align-items-center gap-3 mb-4">
              <Rate disabled value={reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 4} allowHalf style={{ fontSize: '16px' }} />
              <Text type="secondary">({reviews.length} reviews)</Text>
              {product.stock_qty > 0 ? <Tag color="green">In Stock</Tag> : <Tag color="red">Out of Stock</Tag>}
            </div>
            
            <div className="mb-4">
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f5222d', marginRight: 16 }}>
                ₹{displayPrice}
              </span>
              {discount > 0 && (
                <>
                  <Text delete style={{ fontSize: '1.2rem', color: '#8c8c8c', marginRight: 16 }}>
                    ₹{product.mrp}
                  </Text>
                  <Tag color="red" style={{ fontSize: '1rem', padding: '2px 8px' }}>
                    {discount}% OFF
                  </Tag>
                </>
              )}
            </div>

            <Paragraph style={{ fontSize: '15px', color: '#555', marginBottom: 24 }}>
              {product.description || 'No description available.'}
            </Paragraph>

            <Divider />

            <div className="d-flex align-items-center gap-3 mb-4">
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Quantity:</span>
              <InputNumber min={1} max={product.stock_qty} value={qty} onChange={v => setQty(v || 1)} size="large" style={{ borderRadius: 8, width: 80 }} />
              <span style={{ fontSize: '12px', color: '#8c8c8c' }}>({product.stock_qty} units available)</span>
            </div>

            <div className="d-flex gap-3 mb-4">
              <Button type="primary" size="large" icon={<ShoppingCartOutlined />} shape="round" style={{ height: 48, paddingInline: 32 }} onClick={handleAddToCart} loading={adding} disabled={product.stock_qty === 0}>
                Add to Cart — ₹{displayPrice * qty}
              </Button>
              <Button size="large" icon={<HeartOutlined />} shape="round" style={{ height: 48 }}>Wishlist</Button>
              <Button size="large" icon={<ShareAltOutlined />} shape="circle" style={{ height: 48, width: 48 }} />
            </div>

            <Card style={{ background: '#f0f5ff', borderRadius: 12, border: 'none' }}>
              <div className="d-flex align-items-center gap-3">
                <TruckOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div>
                  <Text strong>Fast Delivery Available</Text><br />
                  <Text type="secondary" style={{ fontSize: '0.85rem' }}>Estimated delivery: 2-4 hours</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card className="mt-4" style={{ borderRadius: 16, border: 'none' }}>
        <Tabs items={tabItems} />
      </Card>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Title level={3} style={{ margin: 0 }}>Similar Products</Title>
          </div>
          <Row gutter={[20, 20]}>
            {similarProducts.map((p) => {
              const pPrice = p.offer_price || p.selling_price;
              const pDiscount = p.mrp > 0 ? Math.round((p.mrp - pPrice) / p.mrp * 100) : 0;
              return (
                <Col xs={12} sm={8} md={6} lg={4} key={p.product_id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}
                    bodyStyle={{ padding: 12 }}
                    cover={
                      <div
                        style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', overflow: 'hidden', padding: 8, cursor: 'pointer' }}
                        onClick={() => navigate(`/product/${p.product_id}`)}
                      >
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.product_name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '3rem' }}>{categoryEmojis[p.category_name] || '📦'}</span>
                        )}
                      </div>
                    }
                  >
                    <div onClick={() => navigate(`/product/${p.product_id}`)} style={{ cursor: 'pointer' }}>
                      <Text type="secondary" style={{ fontSize: '11px', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                        {p.brand_name || 'Generic'}
                      </Text>
                      <Text strong className="d-block text-truncate" style={{ fontSize: '14px', marginTop: 4, height: 20 }}>
                        {p.product_name}
                      </Text>
                      <div className="d-flex align-items-baseline gap-2 mt-2">
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#f5222d' }}>₹{pPrice}</span>
                        {pDiscount > 0 && (
                          <>
                            <Text delete style={{ fontSize: '12px', color: '#8c8c8c' }}>₹{p.mrp}</Text>
                            <span style={{ fontSize: '11px', color: '#389e0d', fontWeight: 600 }}>{pDiscount}% off</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<ShoppingCartOutlined />}
                      block
                      className="mt-3"
                      style={{ borderRadius: 6 }}
                      onClick={() => handleAddSimilarToCart(p.product_id)}
                      disabled={p.stock_qty === 0}
                    >
                      Add to Cart
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;