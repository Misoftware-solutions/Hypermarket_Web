const db = require('../config/db');

exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value, description FROM store_settings');
        // Convert to key-value object
        const settings = {};
        rows.forEach(r => {
            settings[r.setting_key] = r.setting_value;
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expects object: { default_tax: "12", ... }
        if (!updates || typeof updates !== 'object') {
            return res.status(400).json({ error: 'Invalid settings payload' });
        }

        for (const [key, value] of Object.entries(updates)) {
            await db.query(
                'UPDATE store_settings SET setting_value = ? WHERE setting_key = ?',
                [String(value), key]
            );
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
