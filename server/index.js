const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Hypermarket API is running...', version: '1.0.0' });
});

// API Routes
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const brandRoutes = require('./src/routes/brandRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const authRoutes = require('./src/routes/authRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const customerRoutes = require('./src/routes/customerRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`✅ Hypermarket API running on http://localhost:${PORT}`);
});
