const db = require('../config/db');

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search } = req.query;
        let query = `
            SELECT o.*, c.customer_name, c.mobile as customer_phone
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            WHERE 1=1
        `;
        const params = [];
        if (status && status !== 'all') { query += ' AND o.order_status = ?'; params.push(status); }
        if (search) { query += ' AND (o.order_number LIKE ? OR c.customer_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const [order] = await db.query(`
            SELECT o.*, c.customer_name, c.mobile, c.email
            FROM orders o LEFT JOIN customers c ON o.customer_id = c.customer_id
            WHERE o.order_id = ?
        `, [req.params.id]);
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
        const [items] = await db.query(`
            SELECT oi.*, p.product_name FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [req.params.id]);
        res.json({ ...order[0], items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { order_status } = req.body;
        await db.query('UPDATE orders SET order_status = ? WHERE order_id = ?', [order_status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get customer orders
exports.getCustomerOrders = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.*, (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) as item_count
            FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC
        `, [req.params.customerId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
