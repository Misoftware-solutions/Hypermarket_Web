const db = require('../config/db');

// Get all brands
exports.getAllBrands = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM brands ORDER BY brand_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create brand
exports.createBrand = async (req, res) => {
    try {
        const { brand_name } = req.body;
        const [result] = await db.query('INSERT INTO brands (brand_name) VALUES (?)', [brand_name]);
        res.status(201).json({ brand_id: result.insertId, brand_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update brand
exports.updateBrand = async (req, res) => {
    try {
        const { brand_name } = req.body;
        await db.query('UPDATE brands SET brand_name = ? WHERE brand_id = ?', [brand_name, req.params.id]);
        res.json({ message: 'Brand updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete brand
exports.deleteBrand = async (req, res) => {
    try {
        await db.query('DELETE FROM brands WHERE brand_id = ?', [req.params.id]);
        res.json({ message: 'Brand deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
