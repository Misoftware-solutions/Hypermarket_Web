const db = require('../config/db');

// Get all products with joins
exports.getAllProducts = async (req, res) => {
    try {
        const { category_id, brand_id, search, sort, page = 1, limit = 12, featured, min_price, max_price } = req.query;
        let query = `
            SELECT p.*, c.category_name, b.brand_name, u.unit_name,
                   COALESCE(i.available_qty, 0) as stock_qty,
                   i.low_stock_threshold,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN units u ON p.unit_id = u.unit_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            WHERE p.is_active = 1
        `;
        const params = [];

        if (category_id) { query += ' AND p.category_id = ?'; params.push(category_id); }
        if (brand_id) { query += ' AND p.brand_id = ?'; params.push(brand_id); }
        if (featured === '1') { query += ' AND p.is_featured = 1'; }
        if (search) { query += ' AND p.product_name LIKE ?'; params.push(`%${search}%`); }
        if (min_price) { query += ' AND COALESCE(p.offer_price, p.selling_price) >= ?'; params.push(parseInt(min_price)); }
        if (max_price) { query += ' AND COALESCE(p.offer_price, p.selling_price) <= ?'; params.push(parseInt(max_price)); }

        if (sort === 'price_asc') query += ' ORDER BY COALESCE(p.offer_price, p.selling_price) ASC';
        else if (sort === 'price_desc') query += ' ORDER BY COALESCE(p.offer_price, p.selling_price) DESC';
        else if (sort === 'newest') query += ' ORDER BY p.created_at DESC';
        else query += ' ORDER BY p.product_id DESC';

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [rows] = await db.query(query, params);

        // Convert BIT columns to standard numbers (prevent Buffer objects from being treated as truthy on client)
        rows.forEach(p => {
            p.is_featured = p.is_featured !== null ? (Buffer.isBuffer(p.is_featured) ? p.is_featured[0] : p.is_featured) : 0;
            p.is_active = p.is_active !== null ? (Buffer.isBuffer(p.is_active) ? p.is_active[0] : p.is_active) : 1;
        });

        let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = 1';
        const countParams = [];
        if (category_id) { countQuery += ' AND p.category_id = ?'; countParams.push(category_id); }
        if (brand_id) { countQuery += ' AND p.brand_id = ?'; countParams.push(brand_id); }
        if (featured === '1') { countQuery += ' AND p.is_featured = 1'; }
        if (search) { countQuery += ' AND p.product_name LIKE ?'; countParams.push(`%${search}%`); }
        if (min_price) { countQuery += ' AND COALESCE(p.offer_price, p.selling_price) >= ?'; countParams.push(parseInt(min_price)); }
        if (max_price) { countQuery += ' AND COALESCE(p.offer_price, p.selling_price) <= ?'; countParams.push(parseInt(max_price)); }

        const [countResult] = await db.query(countQuery, countParams);

        res.json({
            products: rows,
            total: countResult[0].total,
            page: parseInt(page),
            totalPages: Math.ceil(countResult[0].total / parseInt(limit))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, c.category_name, b.brand_name, u.unit_name,
                   COALESCE(i.available_qty, 0) as stock_qty
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            LEFT JOIN units u ON p.unit_id = u.unit_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            WHERE p.product_id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        
        // Convert BIT columns to standard numbers (prevent Buffer objects from being treated as truthy on client)
        rows[0].is_featured = rows[0].is_featured !== null ? (Buffer.isBuffer(rows[0].is_featured) ? rows[0].is_featured[0] : rows[0].is_featured) : 0;
        rows[0].is_active = rows[0].is_active !== null ? (Buffer.isBuffer(rows[0].is_active) ? rows[0].is_active[0] : rows[0].is_active) : 1;

        const [images] = await db.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [req.params.id]);
        res.json({ ...rows[0], images });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create product
exports.createProduct = async (req, res) => {
    try {
        const { product_name, category_id, brand_id, unit_id, size, mrp, selling_price, offer_price, tax_percent, hsn_code, description, is_featured } = req.body;
        const slug = product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const [result] = await db.query(
            `INSERT INTO products (product_name, slug, category_id, brand_id, unit_id, size, mrp, selling_price, offer_price, tax_percent, hsn_code, description, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [product_name, slug, category_id, brand_id, unit_id, size || null, mrp, selling_price, offer_price || null, tax_percent || 0, hsn_code, description, is_featured ? 1 : 0]
        );
        await db.query('INSERT INTO inventory (product_id, available_qty) VALUES (?, 0)', [result.insertId]);
        res.status(201).json({ product_id: result.insertId, message: 'Product created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const { product_name, category_id, brand_id, unit_id, size, mrp, selling_price, offer_price, tax_percent, hsn_code, description, is_featured, is_active } = req.body;
        const slug = product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Fetch current product to prevent overwriting missing status flags with 0
        const [existing] = await db.query('SELECT is_active, is_featured, size FROM products WHERE product_id = ?', [req.params.id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Convert dynamic BIT/buffer types to number if read from db
        const currentActive = existing[0].is_active !== null ? (Buffer.isBuffer(existing[0].is_active) ? existing[0].is_active[0] : existing[0].is_active) : 1;
        const currentFeatured = existing[0].is_featured !== null ? (Buffer.isBuffer(existing[0].is_featured) ? existing[0].is_featured[0] : existing[0].is_featured) : 0;
        const currentSize = existing[0].size;

        const final_active = is_active !== undefined ? (is_active ? 1 : 0) : currentActive;
        const final_featured = is_featured !== undefined ? (is_featured ? 1 : 0) : currentFeatured;
        const final_size = size !== undefined ? size : currentSize;

        await db.query(
            `UPDATE products SET product_name=?, slug=?, category_id=?, brand_id=?, unit_id=?, size=?, mrp=?, selling_price=?, offer_price=?, tax_percent=?, hsn_code=?, description=?, is_featured=?, is_active=? WHERE product_id=?`,
            [product_name, slug, category_id, brand_id, unit_id, final_size, mrp, selling_price, offer_price || null, tax_percent, hsn_code, description, final_featured, final_active, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete (soft delete)
exports.deleteProduct = async (req, res) => {
    try {
        await db.query('UPDATE products SET is_active = 0 WHERE product_id = ?', [req.params.id]);
        res.json({ message: 'Product deactivated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
