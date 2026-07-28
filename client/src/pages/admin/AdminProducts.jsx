import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, Typography, Card, Switch, Upload, Row, Col, Statistic, Badge, message, Alert, AutoComplete } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, InboxOutlined } from '@ant-design/icons';
import { getProducts, getCategories, getBrands, createProduct, deleteProduct, updateProduct, uploadProductImage } from '../../services/api';
const {
  Title,
  Text
} = Typography;
const {
  Dragger
} = Upload;
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setProductSuggestions([]);
    setFileList([]);
    form.resetFields();
  };

  const handleProductNameSearch = (searchText) => {
    if (!searchText || !searchText.trim()) {
      setProductSuggestions([]);
      return;
    }
    
    const matches = products.filter(p => 
      p.product_name.toLowerCase().includes(searchText.toLowerCase()) && 
      p.product_id !== editingProduct?.product_id
    );

    const options = matches.map(p => ({
      value: p.product_name,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{p.product_name}</span>
          <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
            ({p.category_name || 'Category'} - ₹{Math.round(Number(p.selling_price))})
          </span>
        </div>
      ),
      product: p
    }));
    
    setProductSuggestions(options);
  };

  const handleProductSelect = (value, option) => {
    const selectedProduct = option?.product;
    if (selectedProduct) {
      setEditingProduct(selectedProduct);
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        setFileList(selectedProduct.images.map((img, idx) => ({
          uid: `-${img.image_id || idx + 1}`,
          name: img.image_url.split('/').pop() || `image_${idx + 1}.png`,
          status: 'done',
          url: img.image_url
        })));
      } else if (selectedProduct.primary_image) {
        setFileList([{
          uid: '-1',
          name: 'primary_image.png',
          status: 'done',
          url: selectedProduct.primary_image
        }]);
      } else {
        setFileList([]);
      }
      form.setFieldsValue({
        product_name: selectedProduct.product_name,
        category_id: selectedProduct.category_id,
        brand_id: selectedProduct.brand_id,
        mrp: selectedProduct.mrp,
        selling_price: selectedProduct.selling_price,
        offer_percentage: selectedProduct.mrp > 0 && selectedProduct.offer_price ? Math.round(((selectedProduct.mrp - selectedProduct.offer_price) / selectedProduct.mrp) * 100) : 0,
        tax_percent: selectedProduct.tax_percent,
        unit_id: selectedProduct.unit_id,
        size: selectedProduct.size,
        is_featured: !!selectedProduct.is_featured,
        description: selectedProduct.description
      });
      message.info(`Loaded details for existing product: ${selectedProduct.product_name}`);
    }
  };

  const productNameVal = Form.useWatch('product_name', form);
  const matchedProduct = products.find(
    p => productNameVal && p.product_name.toLowerCase() === productNameVal.trim().toLowerCase() && p.product_id !== editingProduct?.product_id
  );

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([getProducts({
        limit: 100
      }), getCategories(), getBrands()]);
      setProducts(prodRes.data.products || []);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch {/* API not available */} finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const base64Str = canvas.toDataURL('image/jpeg', 0.5);
          resolve(base64Str);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleUploadImage = async (file) => {
    try {
      const fileData = await compressImage(file);
      const ext = 'jpg';
      const fileName = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const res = await uploadProductImage({ fileName, fileData });
      return res.data.url;
    } catch (err) {
      throw err;
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const uploadedImageUrls = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.originFileObj) {
          const url = await handleUploadImage(file.originFileObj);
          uploadedImageUrls.push(url);
        } else if (file.url && file.url.startsWith('data:image')) {
          // Convert existing base64 URL to clean server image file path
          const ext = 'jpg';
          const fileName = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
          const res = await uploadProductImage({ fileName, fileData: file.url });
          uploadedImageUrls.push(res.data.url);
        } else if (file.url) {
          uploadedImageUrls.push(file.url);
        }
      }
      
      // Calculate offer_price as integer from MRP and offer_percentage
      const mrp = Math.round(values.mrp || 0);
      const offerPct = Math.round(values.offer_percentage || 0);
      const offerPrice = offerPct > 0 ? Math.round(mrp * (1 - offerPct / 100)) : null;

      const payload = {
        ...values,
        mrp,
        selling_price: Math.round(values.selling_price || 0),
        offer_price: offerPrice,
        tax_percent: Math.round(values.tax_percent || 0),
        is_featured: values.is_featured ? 1 : 0,
        is_active: editingProduct ? (editingProduct.is_active ? 1 : 0) : 1,
        image_urls: uploadedImageUrls,
        image_url: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null
      };
      
      delete payload.offer_percentage;

      if (editingProduct) {
        await updateProduct(editingProduct.product_id, payload);
        message.success('Product updated!');
      } else {
        await createProduct(payload);
        message.success('Product created!');
      }

      handleCancel();
      fetchData();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = id => {
    Modal.confirm({
      title: 'Are you sure you want to Delete this product?',
      content: 'This product will no longer be visible to customers.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteProduct(id);
          message.success('Product Deleted');
          fetchData();
        } catch (err) {
          message.error('Failed to Delete product');
        }
      }
    });
  };
  const filtered = products.filter(p => p.product_name.toLowerCase().includes(search.toLowerCase()));
  const activeCount = filtered.filter(p => p.is_active).length;
  const outOfStock = filtered.filter(p => (p.stock_qty || 0) === 0).length;
  const featuredCount = filtered.filter(p => p.is_featured).length;
  const columns = [{
    title: 'Product',
    dataIndex: 'product_name',
    render: (name, r) => (
      <div className="d-flex align-items-center gap-2">
        {r.primary_image ? (
          <img src={r.primary_image} alt={name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
        ) : (
          <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
        )}
        <div>
          <Text strong>{name}</Text>
          {r.size && <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{r.size}</div>}
        </div>
      </div>
    )
  }, {
    title: 'Category',
    dataIndex: 'category_name',
    render: c => <Tag color="blue">{c}</Tag>
  }, {
    title: 'Brand',
    dataIndex: 'brand_name'
  }, {
    title: 'MRP',
    dataIndex: 'mrp',
    render: v => <Text type="secondary">₹{Math.round(Number(v))}</Text>,
    width: 100
  }, {
    title: 'Selling',
    dataIndex: 'selling_price',
    render: v => <Text strong>₹{Math.round(Number(v))}</Text>,
    width: 110
  }, {
    title: 'Offer',
    dataIndex: 'offer_price',
    render: v => v ? <Tag color="green">₹{Math.round(Number(v))}</Tag> : '—',
    width: 100
  }, {
    title: 'Stock',
    dataIndex: 'stock_qty',
    render: v => {
      const qty = v || 0;
      if (qty === 0) return <Badge status="error" text={<Text type="danger">Out</Text>} />;
      if (qty < 20) return <Badge status="warning" text={<Text style={{
        color: '#faad14'
      }}>{qty}</Text>} />;
      return <Badge status="success" text={<Text style={{
        color: '#52c41a'
      }}>{qty}</Text>} />;
    },
    width: 100
  }, {
    title: 'Actions',
    width: 100,
    render: (_, r) => <Space>
          <Button type="text" icon={<EditOutlined />} onClick={async () => {
            setEditingProduct(r);
            form.setFieldsValue({
              product_name: r.product_name,
              category_id: r.category_id,
              brand_id: r.brand_id,
              mrp: r.mrp,
              selling_price: r.selling_price,
              offer_percentage: r.mrp > 0 && r.offer_price ? Math.round(((r.mrp - r.offer_price) / r.mrp) * 100) : 0,
              tax_percent: r.tax_percent,
              unit_id: r.unit_id,
              size: r.size,
              is_featured: !!r.is_featured,
              description: r.description
            });
            setIsModalOpen(true);

            // Fetch complete product details including images array from backend
            try {
              const { getProductById } = await import('../../services/api');
              const res = await getProductById(r.product_id);
              const fullProd = res.data;
              if (fullProd.images && fullProd.images.length > 0) {
                setFileList(fullProd.images.map((img, idx) => ({
                  uid: `-${img.image_id || idx + 1}`,
                  name: img.image_url.split('/').pop() || `image_${idx + 1}.png`,
                  status: 'done',
                  url: img.image_url
                })));
              } else if (fullProd.primary_image) {
                setFileList([{
                  uid: '-1',
                  name: 'primary_image.png',
                  status: 'done',
                  url: fullProd.primary_image
                }]);
              } else {
                setFileList([]);
              }
            } catch (err) {
              if (r.primary_image) {
                setFileList([{ uid: '-1', name: 'primary_image.png', status: 'done', url: r.primary_image }]);
              }
            }
          }} style={{
        color: '#1890ff'
      }} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.product_id)} />
        </Space>
  }];

  const handleMrpChange = (val) => {
    const mrp = Number(val) || 0;
    const sp = form.getFieldValue('selling_price');
    const offerPct = form.getFieldValue('offer_percentage');

    if (mrp > 0) {
      if (sp !== undefined && sp !== null && sp !== '') {
        const calculatedOffer = Math.max(0, Math.min(100, Math.round(((mrp - Number(sp)) / mrp) * 100)));
        form.setFieldValue('offer_percentage', calculatedOffer);
      } else if (offerPct !== undefined && offerPct !== null && offerPct !== '') {
        const calculatedSp = Math.round(mrp * (1 - Number(offerPct) / 100));
        form.setFieldValue('selling_price', calculatedSp);
      }
    }
  };

  const handleSellingPriceChange = (val) => {
    const sp = Number(val) || 0;
    const mrp = form.getFieldValue('mrp');

    if (mrp && Number(mrp) > 0) {
      const calculatedOffer = Math.max(0, Math.min(100, Math.round(((Number(mrp) - sp) / Number(mrp)) * 100)));
      form.setFieldValue('offer_percentage', calculatedOffer);
    }
  };

  const handleOfferPctChange = (val) => {
    const offerPct = Number(val) || 0;
    const mrp = form.getFieldValue('mrp');

    if (mrp && Number(mrp) > 0) {
      const calculatedSp = Math.round(Number(mrp) * (1 - offerPct / 100));
      form.setFieldValue('selling_price', calculatedSp);
    }
  };

  return <div>
      <Row gutter={16} className="mb-4">
        {[{
        title: 'Total',
        value: filtered.length,
        color: '#1890ff'
      }, {
        title: 'Active',
        value: activeCount,
        color: '#52c41a'
      }, {
        title: 'Out of Stock',
        value: outOfStock,
        color: '#ff4d4f'
      }, {
        title: 'Featured',
        value: featuredCount,
        color: '#722ed1'
      }].map((s, i) => <Col xs={12} md={6} key={i}>
            <Card style={{
          borderRadius: 12,
          borderTop: `3px solid ${s.color}`
        }} bodyStyle={{
          padding: '16px 20px'
        }}>
              <Statistic title={s.title} value={s.value} valueStyle={{
            color: s.color,
            fontSize: '1.5rem'
          }} />
            </Card>
          </Col>)}
      </Row>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Title level={3} style={{
        margin: 0
      }}>Products</Title>
        <Space>
          <Input prefix={<SearchOutlined />} placeholder="Search..." style={{
          width: 250
        }} value={search} onChange={e => setSearch(e.target.value)} />
          <Button icon={<ExportOutlined />}>Export</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingProduct(null); setProductSuggestions([]); setFileList([]); form.resetFields(); setIsModalOpen(true); }}>Add Product</Button>
        </Space>
      </div>
      <Card style={{
      borderRadius: 12
    }} bodyStyle={{
      padding: 0
    }}>
        <Table columns={columns} dataSource={filtered.map(p => ({
        ...p,
        key: p.product_id
      }))} loading={loading} pagination={{
        pageSize: 10,
        showTotal: t => `${t} products`
      }} />
      </Card>
      <Modal title={editingProduct ? "Edit Product" : "Add New Product"} open={isModalOpen} onCancel={handleCancel} width={720} onOk={handleCreate} confirmLoading={submitting}>
        <Form form={form} layout="vertical" size="large">
          {matchedProduct && (
            <Alert
              message={
                <span>
                  Product "<strong>{matchedProduct.product_name}</strong>" already exists. 
                  <Button 
                    type="link" 
                    onClick={() => handleProductSelect(matchedProduct.product_name, { product: matchedProduct })}
                    style={{ padding: 0, marginLeft: 8 }}
                  >
                    Click here to edit this product details
                  </Button>
                </span>
              }
              type="warning"
              showIcon
              className="mb-3"
            />
          )}
          <Form.Item
            name="product_name"
            label="Product Name"
            tooltip="Name of the product (e.g. Fresh Red Apples). Must be unique."
            rules={[{
              required: true,
              message: 'Please enter product name'
            }, {
              validator: (_, value) => {
                if (value && products.some(p => p.product_name.toLowerCase() === value.trim().toLowerCase() && p.product_id !== editingProduct?.product_id)) {
                  return Promise.reject(new Error('Product already exists!'));
                }
                return Promise.resolve();
              }
            }]}
          >
            <AutoComplete
              options={productSuggestions}
              onSearch={handleProductNameSearch}
              onSelect={handleProductSelect}
              placeholder="Enter product name"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Category"
                tooltip="Select the category this product belongs to"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select options={categories.map(c => ({
                  value: c.category_id,
                  label: c.category_name
                }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="brand_id"
                label="Brand"
                tooltip="Select the brand/manufacturer of the product"
              >
                <Select options={brands.map(b => ({
                  value: b.brand_id,
                  label: b.brand_name
                }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="mrp"
                label="MRP (₹)"
                tooltip="MRP is the rate which is present in the product (maximum retail price)"
                rules={[{ required: true, message: 'Please enter MRP' }]}
              >
                <InputNumber className="w-100" min={0} precision={0} step={1} onChange={handleMrpChange} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="selling_price"
                label="Selling Price (₹)"
                tooltip="The standard rate at which this product is sold to customers"
                rules={[{ required: true, message: 'Please enter selling price' }]}
              >
                <InputNumber className="w-100" min={0} precision={0} step={1} onChange={handleSellingPriceChange} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="offer_percentage"
                label="Offer %"
                tooltip="Discount percentage (0 to 100%) to calculate the offer price from MRP"
              >
                <InputNumber className="w-100" min={0} max={100} precision={0} step={1} formatter={value => `${value}%`} parser={value => value.replace('%', '')} onChange={handleOfferPctChange} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="size"
                label="Size"
                tooltip="Size of the product (e.g., 500g, 1L, Small, Medium, Large)"
              >
                <Input placeholder="e.g., 500g, 1L" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="unit_id"
                label="Unit"
                tooltip="Measurement unit of the product (e.g., kg for weight, pcs for count)"
                rules={[{ required: true, message: 'Please select unit' }]}
              >
                <Select options={[{
                  value: 1,
                  label: 'kg'
                }, {
                  value: 2,
                  label: 'g'
                }, {
                  value: 3,
                  label: 'ltr'
                }, {
                  value: 5,
                  label: 'pcs'
                }, {
                  value: 6,
                  label: 'pack'
                }]} />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="is_featured"
                label="Featured"
                tooltip="When enabled, this product is prominently displayed on the homepage dashboard"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Description"
            tooltip="Detailed specifications, characteristics, and details about the product"
            rules={[{ required: true, message: 'Please enter product description' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Product Images (Up to 5)">
            <Dragger
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(0, 5))}
              maxCount={5}
              multiple
              listType="picture"
              accept="image/*"
            >
              <p className="ant-upload-drag-icon"><InboxOutlined style={{
                fontSize: 40,
                color: '#1890ff'
              }} /></p>
              <p className="ant-upload-text">Click or drag up to 5 images to upload</p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>;
};
export default AdminProducts;