import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Select, Input, Tag, Button, Pagination, Spin, Empty, Slider, Checkbox, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts, getCategories, getBrands, addToCart } from '../services/api';
import { categoryEmojis } from '../utils/constants';
const {
  Title,
  Text
} = Typography;
const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [addingCartId, setAddingCartId] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 2000]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault(); // Stop Link navigation from triggering
    const userString = sessionStorage.getItem('user');
    if (!userString) {
      message.warning('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    setAddingCartId(productId);
    try {
      const user = JSON.parse(userString);
      await addToCart({
        customer_id: user.id,
        product_id: productId,
        qty: 1
      });
      message.success('Item added to cart!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setAddingCartId(null);
    }
  };
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearch(searchVal);
    }
  }, [searchParams]);
  useEffect(() => {
    fetchProducts();
  }, [page, sort, selectedCategory, selectedBrand, search, priceRange]);
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([getCategories(), getBrands()]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch {/* ignore */}
    };
    fetchFilters();
  }, []);
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort
      };
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedBrand) params.brand_id = selectedBrand;
      if (search) params.search = search;
      params.min_price = priceRange[0];
      params.max_price = priceRange[1];
      const res = await getProducts(params);
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch {/* ignore */} finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };
  return <div style={{
    padding: '30px 50px',
    background: '#f8f9fa',
    minHeight: '80vh'
  }}>
      <Row gutter={24}>
        {/* Sidebar Filters */}
        <Col xs={24} md={6}>
          <Card style={{
          borderRadius: 12,
          marginBottom: 16
        }} title="Filters">
            <div className="mb-4">
              <Text strong>Search</Text>
              <Input.Search placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} onSearch={handleSearch} className="mt-2" />
            </div>
            <div className="mb-4">
              <Text strong>Category</Text>
              <div className="mt-2">
                <div style={{
                cursor: 'pointer',
                marginBottom: 4
              }} onClick={() => {
                setSelectedCategory('');
                setPage(1);
              }}>
                  <Tag color={!selectedCategory ? 'blue' : 'default'}>All Categories</Tag>
                </div>
                {categories.map(c => <div key={c.category_id} style={{
                cursor: 'pointer',
                marginBottom: 4
              }} onClick={() => {
                setSelectedCategory(String(c.category_id));
                setPage(1);
              }}>
                    <Tag color={selectedCategory === String(c.category_id) ? 'blue' : 'default'}>{categoryEmojis[c.category_name] || '📦'} {c.category_name}</Tag>
                  </div>)}
              </div>
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <Text strong>Price Range</Text>
                <Text type="secondary" style={{ fontSize: '0.8rem' }}>
                  ₹{tempPriceRange[0]} - ₹{tempPriceRange[1]}
                </Text>
              </div>
              <Slider
                range
                min={0}
                max={2000}
                step={1}
                value={tempPriceRange}
                onChange={setTempPriceRange}
                onAfterChange={setPriceRange}
                style={{ marginTop: '12px' }}
              />
              <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                <span>₹0</span>
                <span>₹2000+</span>
              </div>
            </div>
            <div className="mb-4">
              <Text strong>Brand</Text>
              <div className="mt-2" style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #f0f0f0', padding: '8px', borderRadius: '8px', background: '#fff' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Checkbox 
                    checked={!selectedBrand} 
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrand('');
                        setPage(1);
                      }
                    }}
                  >
                    All Brands
                  </Checkbox>
                </div>
                {brands.map(b => (
                  <div key={b.brand_id} style={{ marginBottom: '8px' }}>
                    <Checkbox
                      checked={selectedBrand === String(b.brand_id)}
                      onChange={(e) => {
                        setSelectedBrand(e.target.checked ? String(b.brand_id) : '');
                        setPage(1);
                      }}
                    >
                      {b.brand_name}
                    </Checkbox>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>

        {/* Products Grid */}
        <Col xs={24} md={18}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Text>{total} products found</Text>
            <Select value={sort} onChange={v => {
            setSort(v);
            setPage(1);
          }} style={{
            width: 180
          }} options={[{
            value: 'newest',
            label: 'Newest First'
          }, {
            value: 'price_asc',
            label: 'Price: Low to High'
          }, {
            value: 'price_desc',
            label: 'Price: High to Low'
          }]} />
          </div>

          {loading ? <div className="text-center py-5"><Spin size="large" /></div> : products.length === 0 ? <Empty description="No products found" /> : <>
              <Row gutter={[16, 16]}>
                {products.map(product => {
              const discount = product.mrp > 0 ? Math.round((product.mrp - (product.offer_price || product.selling_price)) / product.mrp * 100) : 0;
              const displayPrice = product.offer_price || product.selling_price;
              return <Col xs={12} sm={8} md={6} key={product.product_id}>
                      <Link to={`/product/${product.product_id}`} style={{
                  textDecoration: 'none'
                }}>
                        <Card hoverable style={{
                    borderRadius: 16,
                    border: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    height: '100%'
                  }}>
                          <div style={{
                      position: 'relative'
                    }}>
                            {discount > 0 && <Tag color="#f5222d" style={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        zIndex: 1,
                        borderRadius: 8,
                        fontWeight: 700
                      }}>{discount}% OFF</Tag>}
                            <div style={{
                        height: 120,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#fafafa',
                        borderRadius: 12,
                        marginBottom: 12,
                        fontSize: '3rem',
                        overflow: 'hidden'
                      }}>
                                {product.primary_image ? (
                                  <img src={product.primary_image} alt={product.product_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                  categoryEmojis[product.category_name] || '📦'
                                )}
                              </div>
                          </div>
                          <Tag color="default" style={{
                      borderRadius: 6,
                      marginBottom: 4
                    }}>{product.category_name}</Tag>
                          <Title level={5} ellipsis style={{
                      marginBottom: 2,
                      fontSize: '0.85rem'
                    }}>{product.product_name}</Title>
                          <Text type="secondary" style={{
                      fontSize: '0.75rem'
                    }}>
                            {product.brand_name || ''}
                            {product.brand_name && product.size && ' • '}
                            {product.size || ''}
                          </Text>
                          <div className="d-flex align-items-baseline gap-2 mt-1">
                            <Text strong style={{
                        fontSize: '1.1rem',
                        color: '#1890ff'
                      }}>₹{displayPrice}</Text>
                            {discount > 0 && <Text delete type="secondary" style={{
                        fontSize: '0.8rem'
                      }}>₹{product.mrp}</Text>}
                          </div>
                          <Button type="primary" icon={<ShoppingCartOutlined />} block shape="round" size="small" className="mt-2" onClick={(e) => handleAddToCart(e, product.product_id)} loading={addingCartId === product.product_id}>Add</Button>
                        </Card>
                      </Link>
                    </Col>;
            })}
              </Row>
              <div className="text-center mt-4">
                <Pagination current={page} total={total} pageSize={12} onChange={p => setPage(p)} showSizeChanger={false} />
              </div>
            </>}
        </Col>
      </Row>
    </div>;
};
export default ProductListing;