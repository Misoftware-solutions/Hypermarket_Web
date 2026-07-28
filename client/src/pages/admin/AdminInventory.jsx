import { useState, useEffect } from 'react';
import { Table, Tag, Button, Typography, Card, Input, Select, Space, Row, Col, Statistic, Badge, InputNumber, Modal, Tooltip, message, Tabs, DatePicker, Form, Divider, Popconfirm, Alert } from 'antd';
import { 
  SearchOutlined, 
  WarningOutlined, 
  SyncOutlined, 
  QuestionCircleOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  ShopOutlined, 
  ShoppingCartOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { 
  getInventory, 
  updateStock, 
  getSuppliers, 
  createSupplier, 
  getPurchaseOrders, 
  createPurchaseOrder, 
  getProducts 
} from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminInventory = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ totalItems: 0, totalUnits: 0, lowStock: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [updateModal, setUpdateModal] = useState({ open: false, id: 0, name: '', stock: 0 });
  const [newQty, setNewQty] = useState(0);

  // Purchase Entry & Supplier States
  const [suppliers, setSuppliers] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [supplierModal, setSupplierModal] = useState(false);
  const [submittingPO, setSubmittingPO] = useState(false);

  // Purchase Form State
  const [poSupplierId, setPoSupplierId] = useState(null);
  const [poInvoiceNo, setPoInvoiceNo] = useState('');
  const [poDate, setPoDate] = useState(dayjs());
  const [poPaymentStatus, setPoPaymentStatus] = useState('Paid');
  const [poPaymentMethod, setPoPaymentMethod] = useState('Bank');
  const [poDiscount, setPoDiscount] = useState(0);
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState([
    { key: 1, product_id: null, qty: 1, cost_price: 0, tax_percent: 5, tax_amount: 0, total_amount: 0 }
  ]);

  // Supplier Form
  const [supplierForm] = Form.useForm();

  useEffect(() => {
    fetchInventoryData();
    fetchSuppliersData();
    fetchProductsData();
    fetchPurchaseHistory();
  }, [statusFilter, search]);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await getInventory(params);
      setItems(res.data.items || []);
      setStats(res.data.stats || { totalItems: 0, totalUnits: 0, lowStock: 0, critical: 0 });
    } catch {
      // API fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersData = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data || []);
    } catch (e) {
      console.error('Failed to load suppliers:', e);
    }
  };

  const fetchProductsData = async () => {
    try {
      const res = await getProducts({ limit: 1000 });
      const prods = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProductsList(prods);
    } catch (e) {
      console.error('Failed to load products list:', e);
      setProductsList([]);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const res = await getPurchaseOrders();
      setPurchaseHistory(res.data || []);
    } catch (e) {
      console.error('Failed to load purchase history:', e);
    }
  };

  const [adjustMode, setAdjustMode] = useState('add');
  const [adjustReason, setAdjustReason] = useState('Stock Count Verification');

  const handleUpdateStock = async () => {
    try {
      const targetQty = adjustMode === 'add' ? Number(updateModal.stock || 0) + Number(newQty || 0) : Number(newQty || 0);
      await updateStock(updateModal.id, targetQty, adjustReason);
      message.success(`Stock adjusted! New Total: ${targetQty} units`);
      setUpdateModal({ open: false, id: 0, name: '', stock: 0 });
      setNewQty(0);
      fetchInventoryData();
    } catch {
      message.error('Failed to update stock');
    }
  };

  const handleAddSupplier = async values => {
    try {
      const res = await createSupplier(values);
      message.success('Supplier added successfully!');
      setSupplierModal(false);
      supplierForm.resetFields();
      fetchSuppliersData();
      if (res.data.supplier_id) {
        setPoSupplierId(res.data.supplier_id);
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to add supplier');
    }
  };

  // Purchase Entry Row Calculations
  const updatePoItem = (index, field, value) => {
    const newItems = [...poItems];
    const item = { ...newItems[index], [field]: value };

    if (field === 'product_id') {
      const selectedProd = productsList.find(p => p.product_id === value);
      if (selectedProd) {
        item.cost_price = Number(selectedProd.cost_price || selectedProd.selling_price * 0.8 || 0);
        item.tax_percent = Number(selectedProd.tax_percent || 0);
      }
    }

    const qty = Number(item.qty || 0);
    const cost = Number(item.cost_price || 0);
    const taxPct = Number(item.tax_percent || 0);

    const lineSubtotal = qty * cost;
    item.tax_amount = Number(((lineSubtotal * taxPct) / 100).toFixed(2));
    item.total_amount = Number((lineSubtotal + item.tax_amount).toFixed(2));

    newItems[index] = item;
    setPoItems(newItems);
  };

  const addPoRow = () => {
    setPoItems([
      ...poItems,
      { key: Date.now(), product_id: null, qty: 1, cost_price: 0, tax_percent: 5, tax_amount: 0, total_amount: 0 }
    ]);
  };

  const removePoRow = index => {
    if (poItems.length === 1) {
      message.warning('At least one item line is required');
      return;
    }
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  // Form Totals
  const poSubtotal = poItems.reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.cost_price || 0)), 0);
  const poTaxTotal = poItems.reduce((sum, item) => sum + Number(item.tax_amount || 0), 0);
  const poGrandTotal = Math.max(0, poSubtotal + poTaxTotal - Number(poDiscount || 0));

  const handleSavePurchaseOrder = async () => {
    if (!poSupplierId) {
      message.error('Please select a supplier');
      return;
    }
    const validItems = poItems.filter(i => i.product_id && Number(i.qty) > 0);
    if (!validItems.length) {
      message.error('Please add at least one valid product line item with quantity > 0');
      return;
    }

    setSubmittingPO(true);
    try {
      await createPurchaseOrder({
        supplier_id: poSupplierId,
        invoice_number: poInvoiceNo,
        purchase_date: poDate.format('YYYY-MM-DD'),
        payment_status: poPaymentStatus,
        payment_method: poPaymentMethod,
        subtotal: poSubtotal,
        tax_amount: poTaxTotal,
        discount_amount: poDiscount,
        total_amount: poGrandTotal,
        notes: poNotes,
        items: validItems
      });

      message.success('🎉 Purchase Entry saved! Inventory & Product Cost Prices updated.');
      
      // Reset PO Form
      setPoInvoiceNo('');
      setPoDiscount(0);
      setPoNotes('');
      setPoItems([{ key: Date.now(), product_id: null, qty: 1, cost_price: 0, tax_percent: 5, tax_amount: 0, total_amount: 0 }]);
      
      fetchInventoryData();
      fetchPurchaseHistory();
      setActiveTab('history');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to save purchase entry');
    } finally {
      setSubmittingPO(false);
    }
  };

  const columns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      render: (name, r) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>{r.category_name}</Text>
        </div>
      )
    },
    {
      title: 'Available',
      dataIndex: 'available_qty',
      render: (v, r) => {
        if (r.status === 'critical') return <Badge status="error" text={<Text type="danger" strong>{v}</Text>} />;
        if (r.status === 'low') return <Badge status="warning" text={<Text style={{ color: '#faad14' }} strong>{v}</Text>} />;
        return <Badge status="success" text={<Text style={{ color: '#52c41a' }}>{v}</Text>} />;
      }
    },
    { title: 'Reserved', dataIndex: 'reserved_qty' },
    { title: 'Threshold', dataIndex: 'low_stock_threshold' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: s => {
        if (s === 'critical') return <Tag color="red" icon={<WarningOutlined />}>Critical</Tag>;
        if (s === 'low') return <Tag color="orange">Low Stock</Tag>;
        return <Tag color="green">In Stock</Tag>;
      }
    },
    {
      title: 'Actions',
      render: (_, r) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<SyncOutlined />} 
          onClick={() => {
            setUpdateModal({ open: true, id: r.product_id, name: r.product_name, stock: r.available_qty });
            setNewQty(r.available_qty);
          }}
        >
          Update Stock
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Title level={3} style={{ margin: 0 }}>Inventory & Stock Management</Title>
          <Text type="secondary">Real-time stock tracking, Purchase Entries, and Supplier Directory</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          onClick={() => setActiveTab('purchase')}
        >
          New Purchase Entry (Replenish Stock)
        </Button>
      </div>

      <Tabs 
        type="card"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'inventory',
            label: <span><ShopOutlined /> Stock Overview</span>,
            children: (
              <div>
                <Row gutter={16} className="mb-4">
                  {[
                    { title: 'Total Items', value: stats.totalItems, color: '#1890ff' },
                    { title: 'Total Stock Units', value: stats.totalUnits, color: '#52c41a' },
                    { title: 'Low Stock Alerts', value: stats.lowStock, color: '#faad14' },
                    { title: 'Out of Stock', value: stats.critical, color: '#ff4d4f' }
                  ].map((s, i) => (
                    <Col xs={12} md={6} key={i}>
                      <Card style={{ borderRadius: 12, borderTop: `3px solid ${s.color}` }} styles={{ body: { padding: '16px 20px' } }}>
                        <Statistic title={s.title} value={s.value} styles={{ content: { color: s.color, fontSize: '1.5rem' } }} />
                      </Card>
                    </Col>
                  ))}
                </Row>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Text strong>Product Inventory Listing</Text>
                  <Space>
                    <Input 
                      prefix={<SearchOutlined />} 
                      placeholder="Search product..." 
                      style={{ width: 250 }} 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                    />
                    <Select 
                      value={statusFilter} 
                      onChange={setStatusFilter} 
                      style={{ width: 140 }} 
                      options={[
                        { value: '', label: 'All Status' },
                        { value: 'low', label: 'Low Stock' },
                        { value: 'critical', label: 'Critical' }
                      ]} 
                    />
                  </Space>
                </div>

                <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
                  <Table 
                    columns={columns} 
                    dataSource={items.map(it => ({ ...it, key: it.product_id }))} 
                    loading={loading} 
                    pagination={{ pageSize: 10 }} 
                  />
                </Card>
              </div>
            )
          },
          {
            key: 'purchase',
            label: <span><ShoppingCartOutlined /> New Purchase Entry</span>,
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Title level={4}>Purchase Entry Form (Inward Stock)</Title>
                <Text type="secondary" className="d-block mb-4">
                  Record inward supplier invoices. Submitting auto-increments product stock and updates cost prices.
                </Text>

                {/* Header Section */}
                <Row gutter={16} className="mb-3">
                  <Col span={8}>
                    <Text strong>Supplier *</Text>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <Select 
                        showSearch 
                        placeholder="Select Supplier" 
                        style={{ flex: 1 }} 
                        value={poSupplierId} 
                        onChange={setPoSupplierId}
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={suppliers.map(s => ({ value: s.supplier_id, label: s.supplier_name }))}
                      />
                      <Button icon={<PlusOutlined />} onClick={() => setSupplierModal(true)}>Add</Button>
                    </div>
                  </Col>
                  <Col span={5}>
                    <Text strong>Purchase Date</Text>
                    <DatePicker style={{ width: '100%', marginTop: '4px' }} value={poDate} onChange={setPoDate} />
                  </Col>
                  <Col span={5}>
                    <Text strong>Supplier Bill / Invoice No.</Text>
                    <Input placeholder="e.g. INV-98231" style={{ marginTop: '4px' }} value={poInvoiceNo} onChange={e => setPoInvoiceNo(e.target.value)} />
                  </Col>
                  <Col span={3}>
                    <Text strong>Payment Status</Text>
                    <Select style={{ width: '100%', marginTop: '4px' }} value={poPaymentStatus} onChange={setPoPaymentStatus}>
                      <Select.Option value="Paid">Paid</Select.Option>
                      <Select.Option value="Unpaid">Unpaid</Select.Option>
                      <Select.Option value="Partial">Partial</Select.Option>
                    </Select>
                  </Col>
                  <Col span={3}>
                    <Text strong>Method</Text>
                    <Select style={{ width: '100%', marginTop: '4px' }} value={poPaymentMethod} onChange={setPoPaymentMethod}>
                      <Select.Option value="Bank">Bank / NEFT</Select.Option>
                      <Select.Option value="Cash">Cash</Select.Option>
                      <Select.Option value="UPI">UPI</Select.Option>
                      <Select.Option value="Credit">Credit</Select.Option>
                    </Select>
                  </Col>
                </Row>

                <Divider style={{ margin: '16px 0' }} />

                {/* Line Items Section */}
                <Text strong className="d-block mb-2">Purchased Product Line Items</Text>
                <Table 
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Product',
                      key: 'product_id',
                      width: '35%',
                      render: (_, r, idx) => (
                        <Select 
                          showSearch
                          placeholder="Search product..."
                          style={{ width: '100%' }}
                          value={r.product_id}
                          onChange={v => updatePoItem(idx, 'product_id', v)}
                          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                          options={(Array.isArray(productsList) ? productsList : []).map(p => ({ value: p.product_id, label: `${p.product_name} (Current Stock: ${p.stock_qty || p.available_qty || 0})` }))}
                        />
                      )
                    },
                    {
                      title: 'Qty',
                      key: 'qty',
                      width: '12%',
                      render: (_, r, idx) => (
                        <InputNumber min={1} value={r.qty} onChange={v => updatePoItem(idx, 'qty', v)} style={{ width: '100%' }} />
                      )
                    },
                    {
                      title: 'Unit Cost Price (₹)',
                      key: 'cost_price',
                      width: '15%',
                      render: (_, r, idx) => (
                        <InputNumber min={0} precision={2} value={r.cost_price} onChange={v => updatePoItem(idx, 'cost_price', v)} style={{ width: '100%' }} />
                      )
                    },
                    {
                      title: 'Tax %',
                      key: 'tax_percent',
                      width: '10%',
                      render: (_, r, idx) => (
                        <InputNumber min={0} max={28} value={r.tax_percent} onChange={v => updatePoItem(idx, 'tax_percent', v)} style={{ width: '100%' }} />
                      )
                    },
                    {
                      title: 'Tax Amt (₹)',
                      key: 'tax_amount',
                      width: '12%',
                      render: (_, r) => `₹${r.tax_amount || 0}`
                    },
                    {
                      title: 'Total (₹)',
                      key: 'total_amount',
                      width: '12%',
                      render: (_, r) => <Text strong style={{ color: '#1890ff' }}>₹{r.total_amount || 0}</Text>
                    },
                    {
                      title: '',
                      key: 'action',
                      width: '4%',
                      render: (_, __, idx) => (
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removePoRow(idx)} />
                      )
                    }
                  ]}
                  dataSource={poItems}
                />

                <Button type="dashed" icon={<PlusOutlined />} onClick={addPoRow} block className="mt-3">
                  Add Item Line
                </Button>

                <Divider style={{ margin: '16px 0' }} />

                {/* Footer Totals */}
                <Row justify="end">
                  <Col span={8}>
                    <div className="d-flex justify-content-between mb-1"><Text>Subtotal:</Text><Text>₹{poSubtotal.toFixed(2)}</Text></div>
                    <div className="d-flex justify-content-between mb-1"><Text>GST / Tax Total:</Text><Text>₹{poTaxTotal.toFixed(2)}</Text></div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Text>Discount (₹):</Text>
                      <InputNumber min={0} precision={2} value={poDiscount} onChange={v => setPoDiscount(v || 0)} style={{ width: 120 }} />
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Title level={4} style={{ margin: 0 }}>Grand Total:</Title>
                      <Title level={4} style={{ margin: 0, color: '#52c41a' }}>₹{poGrandTotal.toFixed(2)}</Title>
                    </div>

                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      loading={submittingPO}
                      style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', height: 48 }}
                      onClick={handleSavePurchaseOrder}
                    >
                      Save Purchase & Update Stock
                    </Button>
                  </Col>
                </Row>
              </Card>
            )
          },
          {
            key: 'history',
            label: <span><FileTextOutlined /> Purchase Order History</span>,
            children: (
              <Card style={{ borderRadius: 12 }}>
                <Table 
                  columns={[
                    { title: 'PO Number', dataIndex: 'purchase_number', render: v => <Text strong>{v}</Text> },
                    { title: 'Supplier', dataIndex: 'supplier_name' },
                    { title: 'Invoice No', dataIndex: 'invoice_number', render: v => v || '—' },
                    { title: 'Date', dataIndex: 'purchase_date', render: v => new Date(v).toLocaleDateString() },
                    { title: 'Payment Method', dataIndex: 'payment_method' },
                    { title: 'Payment Status', dataIndex: 'payment_status', render: v => <Tag color={v === 'Paid' ? 'green' : v === 'Partial' ? 'orange' : 'red'}>{v}</Tag> },
                    { title: 'Total Amount', dataIndex: 'total_amount', render: v => <Text strong style={{ color: '#52c41a' }}>₹{v}</Text> }
                  ]}
                  dataSource={purchaseHistory.map(p => ({ ...p, key: p.purchase_id }))}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          },
          {
            key: 'suppliers',
            label: <span><ShopOutlined /> Supplier Directory</span>,
            children: (
              <Card title="Manage Registered Suppliers" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setSupplierModal(true)}>Add Supplier</Button>} style={{ borderRadius: 12 }}>
                <Table 
                  columns={[
                    { title: 'Supplier Name', dataIndex: 'supplier_name', render: v => <Text strong>{v}</Text> },
                    { title: 'Contact Person', dataIndex: 'contact_person', render: v => v || '—' },
                    { title: 'Mobile', dataIndex: 'mobile', render: v => v || '—' },
                    { title: 'Email', dataIndex: 'email', render: v => v || '—' },
                    { title: 'GST Number', dataIndex: 'gst_number', render: v => v ? <Tag color="purple">{v}</Tag> : '—' },
                    { title: 'Address', dataIndex: 'address', render: v => v || '—' }
                  ]}
                  dataSource={suppliers.map(s => ({ ...s, key: s.supplier_id }))}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )
          }
        ]}
      />

      {/* Update Stock Modal */}
      <Modal title={`Stock Adjustment — ${updateModal.name}`} open={updateModal.open} onCancel={() => setUpdateModal({ open: false, id: 0, name: '', stock: 0 })} onOk={handleUpdateStock}>
        <div className="mb-3"><Text>Current Stock: <Text strong style={{ color: '#1890ff', fontSize: '1.1rem' }}>{updateModal.stock} units</Text></Text></div>
        
        <div className="mb-3">
          <Text strong className="d-block mb-1">Adjustment Mode:</Text>
          <Select value={adjustMode} onChange={setAdjustMode} style={{ width: '100%' }}>
            <Select.Option value="add">➕ Add Inward Units (Current + Qty)</Select.Option>
            <Select.Option value="set">✏️ Set Absolute Quantity (Override)</Select.Option>
          </Select>
        </div>

        <div className="mb-3">
          <InputNumber 
            className="w-100" 
            size="large" 
            min={0} 
            precision={0} 
            step={1} 
            value={newQty} 
            onChange={v => setNewQty(v || 0)} 
            addonBefore={adjustMode === 'add' ? 'Units to Add' : 'New Total Stock'} 
          />
        </div>

        <div className="mb-2">
          <Text type="secondary">Audit Reason Note:</Text>
          <Input placeholder="Reason e.g. Stock Count Verification" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} style={{ marginTop: '4px' }} />
        </div>

        {adjustMode === 'add' && (
          <Alert message={`Resulting Stock: ${Number(updateModal.stock || 0) + Number(newQty || 0)} units`} type="info" showIcon className="mt-3" />
        )}
      </Modal>

      {/* Add Supplier Modal */}
      <Modal title="Add New Supplier" open={supplierModal} onCancel={() => setSupplierModal(false)} footer={null}>
        <Form form={supplierForm} layout="vertical" onFinish={handleAddSupplier}>
          <Form.Item name="supplier_name" label="Supplier Company Name" rules={[{ required: true, message: 'Please enter company name' }]}>
            <Input placeholder="e.g. Metro Cash & Carry" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_person" label="Contact Person">
                <Input placeholder="Contact Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mobile" label="Mobile Number">
                <Input placeholder="9876543210" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email Address">
                <Input placeholder="supplier@domain.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gst_number" label="GST Number">
                <Input placeholder="29AAAAA0000A1Z5" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={2} placeholder="Supplier address..." />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setSupplierModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">Save Supplier</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInventory;