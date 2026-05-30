import { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Carousel, Tag, Spin } from 'antd';
import { ArrowRight } from 'lucide-react';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getCategories, getProducts, getBanners } from '../services/api';

const { Title, Text, Paragraph } = Typography;

const Home = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes, bannerRes] = await Promise.all([
          getCategories(),
          getProducts({ featured: '1', limit: 8 }),
          getBanners(),
        ]);
        setCategories(catRes.data || []);
        setFeaturedProducts(prodRes.data.products || []);
        setBanners(bannerRes.data || []);
      } catch { /* API not available */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const categoryEmojis: Record<string, string> = {
    'Fruits & Vegetables': '🥬', 'Dairy & Eggs': '🥛', 'Bakery': '🍞', 'Meat & Seafood': '🥩',
    'Beverages': '🧃', 'Snacks': '🍿', 'Groceries': '🛒', 'Personal Care': '🧴', 'Household': '🏠',
  };

  return (
    <div>
      {/* Hero Carousel */}
      <Carousel autoplay effect="fade">
        {banners.length > 0 ? banners.filter(b => b.position === 'home_top').map((slide, i) => {
          const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          ];
          const btnColors = ['#764ba2', '#f5576c', '#00b4d8'];
          return (
            <div key={slide.banner_id || i}>
              <div style={{ background: slide.image_url && slide.image_url.startsWith('http') ? `url(${slide.image_url}) center/cover` : gradients[i % gradients.length], padding: '80px 50px', minHeight: 380, display: 'flex', alignItems: 'center' }}>
                <div style={{ maxWidth: 600 }}>
                  <Title style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>{slide.title}</Title>
                  <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: 32 }}>Discover the best deals and offers today.</Paragraph>
                  <Link to={slide.link_url || "/products"}>
                    <Button type="primary" size="large" shape="round" style={{ height: 52, paddingInline: 40, fontSize: '1.1rem', background: 'white', color: btnColors[i % btnColors.length], border: 'none', fontWeight: 700 }}>Shop Now →</Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        }) : (
          <div key="fallback">
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '80px 50px', minHeight: 380, display: 'flex', alignItems: 'center' }}>
              <div style={{ maxWidth: 600 }}>
                <Title style={{ color: '#fff', fontSize: '3rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>Fresh Groceries Delivered</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', marginBottom: 32 }}>Get up to 50% off on your first order!</Paragraph>
                <Link to="/products">
                  <Button type="primary" size="large" shape="round" style={{ height: 52, paddingInline: 40, fontSize: '1.1rem', background: 'white', color: '#764ba2', border: 'none', fontWeight: 700 }}>Shop Now →</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </Carousel>

      <div style={{ padding: '40px 50px', background: '#f8f9fa' }}>
        {/* Categories */}
        {loading ? <div className="text-center py-5"><Spin size="large" /></div> : (
          <>
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div><Title level={2} style={{ marginBottom: 4 }}>Shop by Category</Title><Text type="secondary">Browse our wide range of products</Text></div>
                <Link to="/products"><Button type="link" style={{ fontWeight: 600 }}>View All <ArrowRight size={16} /></Button></Link>
              </div>
              <Row gutter={[16, 16]}>
                {categories.map((cat: any) => (
                  <Col xs={8} sm={6} md={4} lg={3} key={cat.category_id}>
                    <Link to={`/products?category=${cat.category_id}`} style={{ textDecoration: 'none' }}>
                      <Card hoverable style={{ borderRadius: 16, textAlign: 'center', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>{categoryEmojis[cat.category_name] || '📦'}</div>
                        <Text strong style={{ fontSize: '0.85rem', color: '#333' }}>{cat.category_name}</Text>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Featured Products */}
            <div className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div><Title level={2} style={{ marginBottom: 4 }}>🔥 Featured Products</Title><Text type="secondary">Handpicked deals just for you</Text></div>
                <Link to="/products"><Button type="link" style={{ fontWeight: 600 }}>View All <ArrowRight size={16} /></Button></Link>
              </div>
              <Row gutter={[16, 16]}>
                {featuredProducts.map((product: any) => {
                  const discount = product.mrp > 0 ? Math.round(((product.mrp - (product.offer_price || product.selling_price)) / product.mrp) * 100) : 0;
                  const displayPrice = product.offer_price || product.selling_price;
                  return (
                    <Col xs={12} sm={8} md={6} key={product.product_id}>
                      <Link to={`/product/${product.product_id}`} style={{ textDecoration: 'none' }}>
                        <Card hoverable style={{ borderRadius: 16, overflow: 'hidden', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', height: '100%' }}>
                          <div style={{ position: 'relative' }}>
                            {discount > 0 && <Tag color="#f5222d" style={{ position: 'absolute', top: -12, right: -12, zIndex: 1, borderRadius: 8, fontWeight: 700 }}>{discount}% OFF</Tag>}
                            <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderRadius: 12, marginBottom: 12, fontSize: '3.5rem' }}>
                              {categoryEmojis[product.category_name] || '📦'}
                            </div>
                          </div>
                          <Tag color="default" style={{ borderRadius: 6, marginBottom: 6 }}>{product.category_name}</Tag>
                          <Title level={5} ellipsis style={{ marginBottom: 2, fontSize: '0.9rem' }}>{product.product_name}</Title>
                          <Text type="secondary" style={{ fontSize: '0.8rem' }}>{product.brand_name}</Text>
                          <div className="d-flex align-items-baseline gap-2 mt-2">
                            <Text strong style={{ fontSize: '1.2rem', color: '#1890ff' }}>₹{displayPrice}</Text>
                            {discount > 0 && <Text delete type="secondary" style={{ fontSize: '0.85rem' }}>₹{product.mrp}</Text>}
                          </div>
                          <Button type="primary" icon={<ShoppingCartOutlined />} block shape="round" className="mt-2" style={{ height: 36 }}>Add to Cart</Button>
                        </Card>
                      </Link>
                    </Col>
                  );
                })}
              </Row>
            </div>
          </>
        )}

        {/* Offer Banner */}
        {banners.filter(b => b.position !== 'home_top').length > 0 ? banners.filter(b => b.position !== 'home_top').slice(0, 1).map((banner, i) => (
          <Card key={i} style={{ borderRadius: 20, overflow: 'hidden', border: 'none', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', marginBottom: 40 }}>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={14}>
                <div style={{ padding: '20px' }}>
                  <Tag color="red" style={{ marginBottom: 12, fontSize: '0.9rem', padding: '4px 16px' }}>Limited Time</Tag>
                  <Title level={2} style={{ marginBottom: 8 }}>{banner.title}</Title>
                  <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>Don't miss out on these exclusive offers. Shop now!</Paragraph>
                  <Link to={banner.link_url || "/products"}><Button type="primary" size="large" shape="round" style={{ height: 48, paddingInline: 32 }}>Grab the Deal →</Button></Link>
                </div>
              </Col>
              <Col xs={24} md={10}><div style={{ fontSize: '8rem', textAlign: 'center' }}>🥬🍎🥕</div></Col>
            </Row>
          </Card>
        )) : (
          <Card style={{ borderRadius: 20, overflow: 'hidden', border: 'none', background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', marginBottom: 40 }}>
            <Row align="middle" gutter={24}>
              <Col xs={24} md={14}>
                <div style={{ padding: '20px' }}>
                  <Tag color="red" style={{ marginBottom: 12, fontSize: '0.9rem', padding: '4px 16px' }}>Limited Time</Tag>
                  <Title level={2} style={{ marginBottom: 8 }}>Weekend Special Offers!</Title>
                  <Paragraph style={{ fontSize: '1.1rem', color: '#666' }}>Get flat 30% off on all fruits & vegetables. Use code <Text strong code>FRESH30</Text></Paragraph>
                  <Link to="/products?category=1"><Button type="primary" size="large" shape="round" style={{ height: 48, paddingInline: 32 }}>Grab the Deal →</Button></Link>
                </div>
              </Col>
              <Col xs={24} md={10}><div style={{ fontSize: '8rem', textAlign: 'center' }}>🥬🍎🥕</div></Col>
            </Row>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
