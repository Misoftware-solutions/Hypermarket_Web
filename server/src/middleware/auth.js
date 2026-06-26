const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hypermarket_secret_key_12345_secure_dev';

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied: Token missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Access denied: Invalid or expired token' });
    }
};

exports.authorizeAdmin = (req, res, next) => {
    exports.authenticate(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied: Administrator privileges required' });
        }
    });
};
