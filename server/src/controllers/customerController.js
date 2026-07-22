const db = require('../config/db');

exports.getAllCustomers = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = `
            SELECT c.*,
                   COUNT(DISTINCT o.order_id) as order_count,
                   COALESCE(SUM(o.grand_total), 0) as total_spent
            FROM customers c
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            WHERE 1=1
        `;
        const params = [];
        if (search) { query += ' AND (c.customer_name LIKE ? OR c.email LIKE ? OR c.mobile LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (status === 'active') { query += ' AND c.is_active = 1'; }
        if (status === 'inactive') { query += ' AND c.is_active = 0'; }
        query += ' GROUP BY c.customer_id ORDER BY c.created_at DESC';
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getCustomerById = async (req, res) => {
    try {
        const [customer] = await db.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
        if (customer.length === 0) return res.status(404).json({ message: 'Customer not found' });
        const [addresses] = await db.query('SELECT * FROM customer_addresses WHERE customer_id = ?', [req.params.id]);
        const [orders] = await db.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10', [req.params.id]);
        res.json({ ...customer[0], addresses, recent_orders: orders });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateCustomer = async (req, res) => {
    try {
        const { customer_name, email, mobile } = req.body;
        if (!customer_name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        await db.query(
            'UPDATE customers SET customer_name = ?, email = ?, mobile = ? WHERE customer_id = ?',
            [customer_name, email, mobile, req.params.id]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { label = 'Home', address_line1, address_line2 = '', city, state = 'Karnataka', pincode, is_default = false } = req.body;
        if (!address_line1 || !city || !pincode) {
            return res.status(400).json({ message: 'Address line 1, city, and pincode are required' });
        }
        const [result] = await db.query(
            'INSERT INTO customer_addresses (customer_id, label, address_line1, address_line2, city, state, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.params.id, label, address_line1, address_line2, city, state, pincode, is_default ? 1 : 0]
        );
        res.status(201).json({
            message: 'Address added successfully',
            address: {
                address_id: result.insertId,
                customer_id: Number(req.params.id),
                label,
                address_line1,
                address_line2,
                city,
                state,
                pincode,
                is_default
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


