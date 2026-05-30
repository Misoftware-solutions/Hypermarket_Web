const db = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalSales] = await db.query('SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE order_status != "Cancelled"');
        const [totalOrders] = await db.query('SELECT COUNT(*) as total FROM orders');
        const [totalCustomers] = await db.query('SELECT COUNT(*) as total FROM customers WHERE is_active = 1');
        const [totalProducts] = await db.query('SELECT COUNT(*) as total FROM products WHERE is_active = 1');

        const [lowStockProducts] = await db.query(`
            SELECT p.product_id, p.product_name, COALESCE(i.available_qty, 0) as stock_qty, i.low_stock_threshold
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
            WHERE p.is_active = 1 AND COALESCE(i.available_qty, 0) <= COALESCE(i.low_stock_threshold, 10)
            ORDER BY i.available_qty ASC LIMIT 10
        `);

        const [recentOrders] = await db.query(`
            SELECT o.*, c.customer_name
            FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id
            ORDER BY o.created_at DESC LIMIT 10
        `);

        const [ordersByStatus] = await db.query(`
            SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status
        `);

        res.json({
            totalSales: totalSales[0].total,
            totalOrders: totalOrders[0].total,
            totalCustomers: totalCustomers[0].total,
            totalProducts: totalProducts[0].total,
            lowStockProducts,
            recentOrders,
            ordersByStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
