const db = require('../config/db');

// Get all suppliers
exports.getSuppliers = async (req, res) => {
    try {
        const [suppliers] = await db.query('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY supplier_name ASC');
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new supplier
exports.createSupplier = async (req, res) => {
    try {
        const { supplier_name, contact_person, mobile, email, address, gst_number } = req.body;
        if (!supplier_name) return res.status(400).json({ error: 'Supplier name is required' });

        const [result] = await db.query(
            `INSERT INTO suppliers (supplier_name, contact_person, mobile, email, address, gst_number) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [supplier_name, contact_person || null, mobile || null, email || null, address || null, gst_number || null]
        );

        res.status(201).json({ message: 'Supplier created successfully', supplier_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create Purchase Entry (Single DB Transaction)
exports.createPurchaseOrder = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const {
            supplier_id,
            invoice_number,
            purchase_date,
            payment_status = 'Unpaid',
            payment_method = 'Bank',
            subtotal,
            tax_amount,
            discount_amount = 0,
            total_amount,
            notes,
            items = []
        } = req.body;

        if (!supplier_id || !items.length) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'Supplier and line items are required' });
        }

        // 1. Generate PO Number
        const purchase_number = `PO-${Date.now().toString().slice(-6)}`;

        // 2. Insert Header into purchase_orders
        const [poResult] = await connection.query(
            `INSERT INTO purchase_orders 
            (purchase_number, supplier_id, invoice_number, purchase_date, payment_status, payment_method, subtotal, tax_amount, discount_amount, total_amount, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [purchase_number, supplier_id, invoice_number || null, purchase_date || new Date(), payment_status, payment_method, subtotal, tax_amount, discount_amount, total_amount, notes || null]
        );

        const purchase_id = poResult.insertId;

        // 3. Process Line Items
        for (const item of items) {
            const { product_id, qty, cost_price, tax_percent = 0, tax_amount = 0, total_amount } = item;

            // Insert into purchase_items
            await connection.query(
                `INSERT INTO purchase_items 
                (purchase_id, product_id, qty, cost_price, tax_percent, tax_amount, total_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [purchase_id, product_id, qty, cost_price, tax_percent, tax_amount, total_amount]
            );

            // Increase available stock in inventory table
            await connection.query(
                `INSERT INTO inventory (product_id, available_qty) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE available_qty = available_qty + VALUES(available_qty)`,
                [product_id, qty]
            );

            // Update cost_price on products
            await connection.query(
                `UPDATE products SET cost_price = ? WHERE product_id = ?`,
                [cost_price, product_id]
            );

            // Audit log in inventory_logs
            try {
                await connection.query(
                    `INSERT INTO inventory_logs (product_id, change_type, qty_change, notes)
                     VALUES (?, 'intake', ?, ?)`,
                    [product_id, qty, `PO Intake ${purchase_number} - Invoice #${invoice_number || 'N/A'}`]
                );
            } catch (e) {
                // Ignore if log table not created
            }
        }

        await connection.commit();
        connection.release();

        res.status(201).json({
            message: 'Purchase Entry saved and inventory updated successfully!',
            purchase_id,
            purchase_number
        });
    } catch (err) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ error: err.message });
    }
};

// Get Purchase Orders List
exports.getPurchaseOrders = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT 
                po.purchase_id,
                po.purchase_number,
                s.supplier_name,
                po.invoice_number,
                po.purchase_date,
                po.payment_status,
                po.payment_method,
                po.total_amount,
                po.created_at,
                COUNT(pi.purchase_item_id) as item_count
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.supplier_id
            LEFT JOIN purchase_items pi ON po.purchase_id = pi.purchase_id
            GROUP BY po.purchase_id
            ORDER BY po.created_at DESC
        `);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
