const db = require('../config/db');

exports.getInventory = async (req, res) => {
    try {
        const { search, status } = req.query;
        let query = `
            SELECT p.product_id, p.product_name, c.category_name,
                   COALESCE(i.available_qty, 0) as available_qty,
                   COALESCE(i.reserved_qty, 0) as reserved_qty,
                   COALESCE(i.low_stock_threshold, 10) as low_stock_threshold,
                   CASE
                       WHEN COALESCE(i.available_qty, 0) = 0 THEN 'critical'
                       WHEN COALESCE(i.available_qty, 0) <= COALESCE(i.low_stock_threshold, 10) THEN 'low'
                       ELSE 'ok'
                   END as status
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE p.is_active = 1
        `;
        const params = [];
        if (search) { query += ' AND p.product_name LIKE ?'; params.push(`%${search}%`); }
        if (status === 'low') { query += ' AND COALESCE(i.available_qty, 0) <= COALESCE(i.low_stock_threshold, 10) AND COALESCE(i.available_qty, 0) > 0'; }
        if (status === 'critical') { query += ' AND COALESCE(i.available_qty, 0) = 0'; }
        query += ' ORDER BY COALESCE(i.available_qty, 0) ASC';
        const [rows] = await db.query(query, params);

        const totalItems = rows.length;
        const totalUnits = rows.reduce((s, r) => s + Number(r.available_qty), 0);
        const lowStock = rows.filter(r => r.status === 'low').length;
        const critical = rows.filter(r => r.status === 'critical').length;

        res.json({ items: rows, stats: { totalItems, totalUnits, lowStock, critical } });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateStock = async (req, res) => {
    try {
        const { qty, reason = 'Manual Stock Adjustment' } = req.body;
        const [existing] = await db.query('SELECT available_qty FROM inventory WHERE product_id = ?', [req.params.id]);
        const oldQty = existing.length > 0 ? Number(existing[0].available_qty) : 0;
        const diff = Number(qty) - oldQty;

        if (existing.length === 0) {
            await db.query('INSERT INTO inventory (product_id, available_qty) VALUES (?, ?)', [req.params.id, qty]);
        } else {
            await db.query('UPDATE inventory SET available_qty = ? WHERE product_id = ?', [qty, req.params.id]);
        }

        // Audit log entry to prevent forged data
        try {
            await db.query(
                `INSERT INTO inventory_logs (product_id, change_type, qty_change, notes) VALUES (?, 'adjustment', ?, ?)`,
                [req.params.id, diff, `Manual adjustment from ${oldQty} to ${qty} (${reason})`]
            );
        } catch (e) {
            // Ignore if log table not present
        }

        res.json({ message: 'Stock updated', previous_qty: oldQty, new_qty: qty });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
