const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hypermarket_secret_key_12345';

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // First check customers
        const [customers] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        
        if (customers.length > 0) {
            const customer = customers[0];
            // Since we inserted dummy hashes in the DB initially (e.g. '$2b$10$dummyhash'), we need a fallback for testing
            // If the hash is literal '$2b$10$dummyhash', we allow 'password123' to work
            let isValid = false;
            
            if (customer.password_hash === '$2b$10$dummyhash' && password === 'password123') {
                isValid = true;
            } else {
                isValid = await bcrypt.compare(password, customer.password_hash);
            }

            if (isValid) {
                const token = jwt.sign(
                    { id: customer.customer_id, email: customer.email, role: 'customer', name: customer.customer_name },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({ token, user: { id: customer.customer_id, name: customer.customer_name, email: customer.email, role: 'customer' } });
            }
        }

        // Then check admin/staff users
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            const user = users[0];
            let isValid = false;

            if (user.password_hash === '$2b$10$dummyhashfordevonly1234567890' && password === 'admin123') {
                isValid = true;
            } else {
                isValid = await bcrypt.compare(password, user.password_hash);
            }

            if (isValid) {
                const token = jwt.sign(
                    { id: user.user_id, email: user.email, role: 'admin', name: user.full_name },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return res.json({ token, user: { id: user.user_id, name: user.full_name, email: user.email, role: 'admin' } });
            }
        }

        return res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { full_name, email, phone, password, referral_code } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const [existing] = await db.query('SELECT * FROM customers WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO customers (customer_name, email, mobile, password_hash, referral_code) VALUES (?, ?, ?, ?, ?)',
            [full_name, email, phone || null, hashedPassword, referral_code || null]
        );

        const token = jwt.sign(
            { id: result.insertId, email, role: 'customer', name: full_name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: result.insertId, name: full_name, email, role: 'customer' }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
