import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';


// Lazy-loaded Customer Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Lazy-loaded Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
import { AuthModalProvider } from './context/AuthModalContext';
import LoginDrawer from './components/LoginDrawer';

const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const LoadingFallback = () => <div className="d-flex justify-content-center align-items-center" style={{
  minHeight: '60vh'
}}>
    <Spin size="large" />
  </div>;
function App() {
  return <ConfigProvider theme={{
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif'
    }
  }}>
      <AuthModalProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <LoginDrawer />
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/order/:orderId" element={<OrderTracking />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="brands" element={<AdminBrands />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="banners" element={<AdminBanners />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </Router>
    </AuthModalProvider>
  </ConfigProvider>;
}
export default App;