const db = require('../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories ORDER BY category_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Category not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create category
exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
        res.status(201).json({ category_id: result.insertId, category_name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        await db.query('UPDATE categories SET category_name = ? WHERE category_id = ?', [category_name, req.params.id]);
        res.json({ message: 'Category updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
