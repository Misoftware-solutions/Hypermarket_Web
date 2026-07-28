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
            SELECT o.*, c.customer_name, c.mobile, c.email,
                   a.address_line1, a.address_line2, a.city, a.state, a.pincode
            FROM orders o 
            LEFT JOIN customers c ON o.customer_id = c.customer_id
            LEFT JOIN customer_addresses a ON o.delivery_address_id = a.address_id
            WHERE o.order_id = ? OR o.order_number = ?
        `, [req.params.id, req.params.id]);
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
        const [items] = await db.query(`
            SELECT oi.*, p.product_name, p.size FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.product_id
            WHERE oi.order_id = ?
        `, [order[0].order_id]);
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

// Place new order
exports.createOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            customer_id,
            delivery_address_id,
            payment_method,
            delivery_slot,
            subtotal,
            tax_amount,
            discount_amount = 0,
            delivery_charge = 0,
            grand_total,
            items
        } = req.body;

        if (!customer_id || !items || items.length === 0) {
            return res.status(400).json({ message: 'Customer ID and items are required' });
        }

        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        const [orderResult] = await connection.query(`
            INSERT INTO orders (order_number, customer_id, delivery_address_id, payment_method, delivery_slot, subtotal, tax_amount, discount_amount, delivery_charge, grand_total, order_status, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?)
        `, [
            orderNumber,
            customer_id,
            delivery_address_id || null,
            payment_method,
            delivery_slot || 'Express',
            subtotal,
            tax_amount,
            discount_amount,
            delivery_charge,
            grand_total,
            payment_method === 'online' ? 'Paid' : 'Pending'
        ]);

        const orderId = orderResult.insertId;

        for (const item of items) {
            const taxItem = Math.round(item.qty * item.unit_price * 0.05);
            await connection.query(`
                INSERT INTO order_items (order_id, product_id, qty, unit_price, tax_amount, total_amount)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                orderId,
                item.product_id,
                item.qty,
                item.unit_price,
                taxItem,
                (item.qty * item.unit_price) + taxItem
            ]);

            await connection.query(`
                UPDATE inventory 
                SET available_qty = GREATEST(0, available_qty - ?)
                WHERE product_id = ?
            `, [item.qty, item.product_id]);
        }

        const [cart] = await connection.query('SELECT cart_id FROM shopping_cart WHERE customer_id = ?', [customer_id]);
        if (cart.length > 0) {
            await connection.query('DELETE FROM shopping_cart_items WHERE cart_id = ?', [cart[0].cart_id]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', order_id: orderId, order_number: orderNumber });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

