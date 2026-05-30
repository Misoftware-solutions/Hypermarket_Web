import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Auth
export const loginUser = (data: Record<string, string>) => API.post('/auth/login', data);
export const registerUser = (data: Record<string, string>) => API.post('/auth/register', data);

// Products
export const getProducts = (params?: Record<string, string | number>) => API.get('/products', { params });
export const getProductById = (id: number | string) => API.get(`/products/${id}`);
export const createProduct = (data: Record<string, unknown>) => API.post('/products', data);
export const updateProduct = (id: number, data: Record<string, unknown>) => API.put(`/products/${id}`, data);
export const deleteProduct = (id: number) => API.delete(`/products/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data: Record<string, unknown>) => API.post('/categories', data);
export const updateCategory = (id: number, data: Record<string, unknown>) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => API.delete(`/categories/${id}`);

// Brands
export const getBrands = () => API.get('/brands');
export const createBrand = (data: { brand_name: string }) => API.post('/brands', data);
export const deleteBrand = (id: number) => API.delete(`/brands/${id}`);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');

// Cart
export const getCart = (customerId: number) => API.get(`/cart/${customerId}`);
export const addToCart = (data: { customer_id: number; product_id: number; qty: number }) => API.post('/cart', data);
export const updateCartItem = (itemId: number, qty: number) => API.put(`/cart/item/${itemId}`, { qty });
export const removeCartItem = (itemId: number) => API.delete(`/cart/item/${itemId}`);

// Orders
export const getOrders = (params?: Record<string, string>) => API.get('/orders', { params });
export const getOrderById = (id: number | string) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id: number, status: string) => API.put(`/orders/${id}/status`, { order_status: status });
export const getCustomerOrders = (customerId: number) => API.get(`/orders/customer/${customerId}`);

// Banners
export const getBanners = () => API.get('/banners');
export const getAllBanners = () => API.get('/banners/all');
export const createBanner = (data: Record<string, unknown>) => API.post('/banners', data);
export const updateBanner = (id: number, data: Record<string, unknown>) => API.put(`/banners/${id}`, data);
export const deleteBanner = (id: number) => API.delete(`/banners/${id}`);

// Inventory
export const getInventory = (params?: Record<string, string>) => API.get('/inventory', { params });
export const updateStock = (productId: number, qty: number) => API.put(`/inventory/${productId}`, { qty });

// Customers (admin)
export const getCustomers = (params?: Record<string, string>) => API.get('/customers', { params });
export const getCustomerById = (id: number) => API.get(`/customers/${id}`);

export default API;
