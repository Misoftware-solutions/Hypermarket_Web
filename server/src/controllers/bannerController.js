const db = require('../config/db');
const fs = require('fs');
const path = require('path');


exports.getActiveBanners = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT banner_id, title, image_url, link_url, position, sort_order, is_active + 0 AS is_active, created_at FROM banners WHERE is_active = 1 ORDER BY sort_order');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllBanners = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT banner_id, title, image_url, link_url, position, sort_order, is_active + 0 AS is_active, created_at FROM banners ORDER BY sort_order');
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

exports.uploadBannerImage = async (req, res) => {
    try {
        const { fileName, fileData } = req.body;
        if (!fileName || !fileData) {
            return res.status(400).json({ error: 'fileName and fileData are required' });
        }

        // Decode base64 data
        const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // Paths for client/src/images/Banners and client/public/images/Banners
        const srcBannersDir = path.join(__dirname, '..', '..', '..', 'client', 'src', 'images', 'Banners');
        const publicBannersDir = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'Banners');

        // Ensure directories exist
        fs.mkdirSync(srcBannersDir, { recursive: true });
        fs.mkdirSync(publicBannersDir, { recursive: true });

        // Save to client/src/images/Banners
        const srcFilePath = path.join(srcBannersDir, fileName);
        fs.writeFileSync(srcFilePath, buffer);

        // Save to client/public/images/Banners
        const publicFilePath = path.join(publicBannersDir, fileName);
        fs.writeFileSync(publicFilePath, buffer);

        res.json({ success: true, url: fileData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
