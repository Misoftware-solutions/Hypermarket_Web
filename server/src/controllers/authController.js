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
            const isValid = await bcrypt.compare(password, customer.password_hash);

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
            const isValid = await bcrypt.compare(password, user.password_hash);

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

// Automatically ensure otp_verifications table exists
const initDb = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS otp_verifications (
                otp_id INT AUTO_INCREMENT PRIMARY KEY,
                mobile VARCHAR(20) NOT NULL,
                otp VARCHAR(10) NOT NULL,
                expires_at DATETIME NOT NULL,
                is_verified BIT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);
        console.log('✅ otp_verifications table ensured');
    } catch (e) {
        console.error('Error ensuring otp_verifications table:', e);
    }
};
initDb();

exports.sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) {
            return res.status(400).json({ message: 'Mobile number is required' });
        }

        // Standardize to 10 digits for DB query
        const tenDigitMobile = mobile.replace(/\D/g, '').slice(-10);
        if (tenDigitMobile.length !== 10) {
            return res.status(400).json({ message: 'Invalid mobile number. Please enter a 10-digit number.' });
        }

        // Check if user exists in customers or users
        const [customers] = await db.query('SELECT * FROM customers WHERE mobile = ? OR mobile LIKE ?', [mobile, `%${tenDigitMobile}`]);
        let userExists = customers.length > 0;
        let isCustomer = true;

        if (!userExists) {
            const [users] = await db.query('SELECT * FROM users WHERE mobile = ? OR mobile LIKE ?', [mobile, `%${tenDigitMobile}`]);
            userExists = users.length > 0;
            isCustomer = false;
        }

        if (!userExists) {
            return res.status(404).json({ message: 'Mobile number not registered. Please register first.' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Expiry time (5 minutes from now)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        // Format for MySQL DATETIME
        const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

        // Save to DB
        await db.query(
            'INSERT INTO otp_verifications (mobile, otp, expires_at) VALUES (?, ?, ?)',
            [tenDigitMobile, otp, expiresAtStr]
        );

        // Send OTP using SimpApp SMS Gateway API
        const smsUrl = process.env.SMS_GATEWAY_URL || 'https://europe-west1-sms-gateway-api-simpapp.cloudfunctions.net/api_v2_sms_send';
        const apiKey = process.env.SMS_GATEWAY_API_KEY || 'sk_live_b932dc9008f4fa3f6ce5c412a10bda1f6f5b31d79494b593504ca93318164de5';
        
        // Normalize phone number for the SMS gateway (must have +91 prefix for India)
        const formattedPhone = `+91${tenDigitMobile}`;
        const messageText = `Your OTP for Mi MART is ${otp}. Valid for 5 minutes.`;

        console.log(`[SMS OTP] Code: ${otp} for phone: ${formattedPhone}`);

        try {
            const response = await fetch(smsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    phoneNumber: formattedPhone,
                    message: messageText
                })
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Failed to send SMS via gateway:', responseText);
                return res.json({ 
                    message: 'OTP sent (simulated fallback). Please check server console logs.', 
                    otp: otp // expose OTP in response for development convenience
                });
            }

            const data = await response.json();
            console.log('SMS Gateway API response:', data);
            
            res.json({ message: 'OTP sent successfully!', otp }); // Return otp in dev/testing mode
        } catch (fetchErr) {
            console.error('Network error calling SMS gateway:', fetchErr);
            return res.json({ 
                message: 'OTP sent (simulated fallback due to connection error). Please check server console logs.', 
                otp: otp
            });
        }
    } catch (error) {
        console.error('Error in sendOtp:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({ message: 'Mobile number and OTP are required' });
        }

        const tenDigitMobile = mobile.replace(/\D/g, '').slice(-10);

        // Find the latest active OTP for this mobile
        const [records] = await db.query(
            'SELECT * FROM otp_verifications WHERE mobile = ? AND otp = ? AND is_verified = 0 ORDER BY created_at DESC LIMIT 1',
            [tenDigitMobile, otp]
        );

        if (records.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const record = records[0];
        const expiresAt = new Date(record.expires_at);
        if (expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Mark OTP as verified
        await db.query('UPDATE otp_verifications SET is_verified = 1 WHERE otp_id = ?', [record.otp_id]);

        // Find the user/customer record
        const [customers] = await db.query('SELECT * FROM customers WHERE mobile = ? OR mobile LIKE ?', [mobile, `%${tenDigitMobile}`]);
        
        if (customers.length > 0) {
            const customer = customers[0];
            const token = jwt.sign(
                { id: customer.customer_id, email: customer.email, role: 'customer', name: customer.customer_name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ token, user: { id: customer.customer_id, name: customer.customer_name, email: customer.email, role: 'customer' } });
        }

        const [users] = await db.query('SELECT * FROM users WHERE mobile = ? OR mobile LIKE ?', [mobile, `%${tenDigitMobile}`]);
        if (users.length > 0) {
            const user = users[0];
            const token = jwt.sign(
                { id: user.user_id, email: user.email, role: 'admin', name: user.full_name },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ token, user: { id: user.user_id, name: user.full_name, email: user.email, role: 'admin' } });
        }

        return res.status(404).json({ message: 'User not found with this mobile number.' });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json({ error: error.message });
    }
};

