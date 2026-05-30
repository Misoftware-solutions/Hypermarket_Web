const db = require('../config/db');

// Get customer's cart
exports.getCart = async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const [cart] = await db.query('SELECT * FROM shopping_cart WHERE customer_id = ?', [customerId]);
        if (cart.length === 0) return res.json({ items: [] });

        const [items] = await db.query(`
            SELECT sci.*, p.product_name, p.selling_price, p.purchase_price,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.product_id AND pi.is_primary = 1 LIMIT 1) as image_url
            FROM shopping_cart_items sci
            JOIN products p ON sci.product_id = p.product_id
            WHERE sci.cart_id = ?
        `, [cart[0].cart_id]);

        res.json({ cart_id: cart[0].cart_id, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { customer_id, product_id, qty } = req.body;

        // Get or create cart
        let [cart] = await db.query('SELECT * FROM shopping_cart WHERE customer_id = ?', [customer_id]);
        let cartId;

        if (cart.length === 0) {
            const [result] = await db.query('INSERT INTO shopping_cart (customer_id) VALUES (?)', [customer_id]);
            cartId = result.insertId;
        } else {
            cartId = cart[0].cart_id;
        }

        // Check if item already in cart
        const [existing] = await db.query('SELECT * FROM shopping_cart_items WHERE cart_id = ? AND product_id = ?', [cartId, product_id]);

        if (existing.length > 0) {
            await db.query('UPDATE shopping_cart_items SET qty = qty + ? WHERE cart_item_id = ?', [qty, existing[0].cart_item_id]);
        } else {
            await db.query('INSERT INTO shopping_cart_items (cart_id, product_id, qty) VALUES (?, ?, ?)', [cartId, product_id, qty]);
        }

        res.json({ message: 'Item added to cart' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update cart item qty
exports.updateCartItem = async (req, res) => {
    try {
        const { qty } = req.body;
        if (qty <= 0) {
            await db.query('DELETE FROM shopping_cart_items WHERE cart_item_id = ?', [req.params.itemId]);
        } else {
            await db.query('UPDATE shopping_cart_items SET qty = ? WHERE cart_item_id = ?', [qty, req.params.itemId]);
        }
        res.json({ message: 'Cart updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
    try {
        await db.query('DELETE FROM shopping_cart_items WHERE cart_item_id = ?', [req.params.itemId]);
        res.json({ message: 'Item removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
