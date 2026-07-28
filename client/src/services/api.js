import axios from 'axios';
const API = axios.create({
  baseURL: '/api'
});

// Add request interceptor to attach JWT token
API.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = data => API.post('/auth/login', data);
export const registerUser = data => API.post('/auth/register', data);
export const sendOtp = data => API.post('/auth/send-otp', data);
export const verifyOtp = data => API.post('/auth/verify-otp', data);


// Products
export const getProducts = params => API.get('/products', {
  params
});
export const getProductById = id => API.get(`/products/${id}`);
export const getProductReviews = id => API.get(`/products/${id}/reviews`);
export const createProductReview = (id, data) => API.post(`/products/${id}/reviews`, data);
export const getProductSuggestions = q => API.get('/products/suggestions', { params: { q } });
export const recordSearch = keyword => API.post('/products/search-record', { keyword });
export const createProduct = data => API.post('/products', data);
export const uploadProductImage = data => API.post('/products/upload', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = id => API.delete(`/products/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = data => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = id => API.delete(`/categories/${id}`);

// Brands
export const getBrands = () => API.get('/brands');
export const createBrand = data => API.post('/brands', data);
export const deleteBrand = id => API.delete(`/brands/${id}`);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');

// Cart
export const getCart = customerId => API.get(`/cart/${customerId}`);
export const addToCart = data => API.post('/cart', data);
export const updateCartItem = (itemId, qty) => API.put(`/cart/item/${itemId}`, {
  qty
});
export const removeCartItem = itemId => API.delete(`/cart/item/${itemId}`);

// Orders
export const getOrders = params => API.get('/orders', {
  params
});
export const getOrderById = id => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, {
  order_status: status
});
export const getCustomerOrders = customerId => API.get(`/orders/customer/${customerId}`);
export const createOrder = data => API.post('/orders', data);

// Banners
export const getBanners = () => API.get('/banners');
export const getAllBanners = () => API.get('/banners/all');
export const createBanner = data => API.post('/banners', data);
export const updateBanner = (id, data) => API.put(`/banners/${id}`, data);
export const deleteBanner = id => API.delete(`/banners/${id}`);
export const uploadBannerImage = data => API.post('/banners/upload', data);

// Inventory
export const getInventory = params => API.get('/inventory', {
  params
});
export const updateStock = (productId, qty) => API.put(`/inventory/${productId}`, {
  qty
});

// Customers (admin & customer profile)
export const getCustomers = params => API.get('/customers', {
  params
});
export const getCustomerById = id => API.get(`/customers/${id}`);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const addCustomerAddress = (id, data) => API.post(`/customers/${id}/addresses`, data);
export const deleteCustomerAddress = (id, addressId) => API.delete(`/customers/${id}/addresses/${addressId}`);
export const setCustomerDefaultAddress = (id, addressId) => API.put(`/customers/${id}/addresses/${addressId}/default`);
export const updateCustomerAddress = (id, addressId, data) => API.put(`/customers/${id}/addresses/${addressId}`, data);

// Settings
export const getSettings = () => API.get('/settings');
export const updateSettings = data => API.put('/settings', data);

// Reports
export const getSalesReport = period => API.get('/reports/sales-summary', { params: { period } });
export const getCategoryBrandReport = () => API.get('/reports/category-brand');
export const getProductPerformanceReport = () => API.get('/reports/product-performance');
export const getInventoryReportData = () => API.get('/reports/inventory-health');
export const getTaxReport = () => API.get('/reports/tax-summary');
export const getProfitReport = () => API.get('/reports/profit-margins');
export const getCustomerMetricsReport = () => API.get('/reports/customer-metrics');
export const getCartAbandonmentReport = () => API.get('/reports/cart-abandonment');
export const getCouponAnalyticsReport = () => API.get('/reports/coupon-analytics');

export default API;