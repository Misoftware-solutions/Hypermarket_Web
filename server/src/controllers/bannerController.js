const db = require('../config/db');

exports.getActiveBanners = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllBanners = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createBanner = async (req, res) => {
    try {
        const { title, image_url, link_url, position, sort_order, is_active } = req.body;
        const [result] = await db.query(
            'INSERT INTO banners (title, image_url, link_url, position, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [title, image_url, link_url, position || 'home_top', sort_order || 0, is_active ? 1 : 0]
        );
        res.status(201).json({ banner_id: result.insertId, message: 'Banner created' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateBanner = async (req, res) => {
    try {
        const { title, image_url, link_url, position, sort_order, is_active } = req.body;
        await db.query(
            'UPDATE banners SET title=?, image_url=?, link_url=?, position=?, sort_order=?, is_active=? WHERE banner_id=?',
            [title, image_url, link_url, position, sort_order, is_active ? 1 : 0, req.params.id]
        );
        res.json({ message: 'Banner updated' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteBanner = async (req, res) => {
    try {
        await db.query('DELETE FROM banners WHERE banner_id = ?', [req.params.id]);
        res.json({ message: 'Banner deleted' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
