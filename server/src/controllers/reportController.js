const db = require('../config/db');

// Get Sales Summary (Sales trends, revenue, order count, AOV, payment methods)
exports.getSalesSummary = async (req, res) => {
    try {
        const { period = 'all' } = req.query;
        let dateWhere = '1=1';
        if (period === '7days') dateWhere = 'created_at >= NOW() - INTERVAL 7 DAY';
        if (period === '30days') dateWhere = 'created_at >= NOW() - INTERVAL 30 DAY';
        if (period === '90days') dateWhere = 'created_at >= NOW() - INTERVAL 90 DAY';
        if (period === '1year') dateWhere = 'created_at >= NOW() - INTERVAL 1 YEAR';

        // Overall stats
        const [overall] = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                COALESCE(SUM(grand_total), 0) as total_revenue,
                COALESCE(AVG(grand_total), 0) as average_order_value,
                COALESCE(SUM(subtotal), 0) as total_subtotal,
                COALESCE(SUM(tax_amount), 0) as total_tax,
                COALESCE(SUM(discount_amount), 0) as total_discounts
            FROM orders
            WHERE ${dateWhere}
        `);

        // Sales trend by date
        const [salesTrend] = await db.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders_count,
                COALESCE(SUM(grand_total), 0) as revenue
            FROM orders
            WHERE ${dateWhere}
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // Payment method breakdown
        const [paymentBreakdown] = await db.query(`
            SELECT 
                COALESCE(payment_method, 'COD') as payment_method,
                COUNT(*) as count,
                COALESCE(SUM(grand_total), 0) as total_amount
            FROM orders
            WHERE ${dateWhere}
            GROUP BY payment_method
        `);

        // Order status breakdown
        const [statusBreakdown] = await db.query(`
            SELECT 
                order_status,
                COUNT(*) as count
            FROM orders
            GROUP BY order_status
        `);

        res.json({
            summary: overall[0],
            salesTrend,
            paymentBreakdown,
            statusBreakdown
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Sales by Category & Brand
exports.getCategoryBrandSales = async (req, res) => {
    try {
        const [byCategory] = await db.query(`
            SELECT 
                c.category_id,
                c.category_name,
                COUNT(DISTINCT oi.order_id) as total_orders,
                COALESCE(SUM(oi.qty), 0) as items_sold,
                COALESCE(SUM(oi.total_amount), 0) as total_revenue
            FROM categories c
            LEFT JOIN products p ON c.category_id = p.category_id
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY c.category_id, c.category_name
            ORDER BY total_revenue DESC
        `);

        const [byBrand] = await db.query(`
            SELECT 
                b.brand_id,
                b.brand_name,
                COUNT(DISTINCT oi.order_id) as total_orders,
                COALESCE(SUM(oi.qty), 0) as items_sold,
                COALESCE(SUM(oi.total_amount), 0) as total_revenue
            FROM brands b
            LEFT JOIN products p ON b.brand_id = p.brand_id
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY b.brand_id, b.brand_name
            ORDER BY total_revenue DESC
        `);

        res.json({ byCategory, byBrand });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Top Selling Products vs Slow Moving / Dead Stock
exports.getProductPerformance = async (req, res) => {
    try {
        const [topProducts] = await db.query(`
            SELECT 
                p.product_id,
                p.product_name,
                p.mrp,
                p.selling_price,
                c.category_name,
                COALESCE(SUM(oi.qty), 0) as total_qty_sold,
                COALESCE(SUM(oi.total_amount), 0) as total_revenue
            FROM products p
            JOIN order_items oi ON p.product_id = oi.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            GROUP BY p.product_id
            ORDER BY total_qty_sold DESC
            LIMIT 10
        `);

        const [slowMoving] = await db.query(`
            SELECT 
                p.product_id,
                p.product_name,
                p.mrp,
                p.selling_price,
                c.category_name,
                COALESCE(i.available_qty, 0) as stock_qty,
                COALESCE(SUM(oi.qty), 0) as total_qty_sold
            FROM products p
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN inventory i ON p.product_id = i.product_id
            GROUP BY p.product_id
            ORDER BY total_qty_sold ASC, stock_qty DESC
            LIMIT 10
        `);

        res.json({ topProducts, slowMoving });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Inventory Health & Stock Valuation Report
exports.getInventoryReport = async (req, res) => {
    try {
        const [lowStock] = await db.query(`
            SELECT 
                p.product_id,
                p.product_name,
                c.category_name,
                i.available_qty,
                i.reserved_qty,
                i.low_stock_threshold
            FROM inventory i
            JOIN products p ON i.product_id = p.product_id
            LEFT JOIN categories c ON p.category_id = c.category_id
            WHERE i.available_qty <= i.low_stock_threshold
            ORDER BY i.available_qty ASC
        `);

        const [valuation] = await db.query(`
            SELECT 
                COUNT(p.product_id) as total_products,
                COALESCE(SUM(i.available_qty), 0) as total_stock_units,
                COALESCE(SUM(i.available_qty * p.selling_price), 0) as total_selling_value,
                COALESCE(SUM(i.available_qty * (p.selling_price * 0.8)), 0) as total_cost_valuation
            FROM products p
            LEFT JOIN inventory i ON p.product_id = i.product_id
        `);

        res.json({
            lowStock,
            valuation: valuation[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get GST / Tax Compliance Report
exports.getTaxReport = async (req, res) => {
    try {
        const [taxByHsn] = await db.query(`
            SELECT 
                COALESCE(p.hsn_code, 'N/A') as hsn_code,
                p.tax_percent,
                COALESCE(SUM(oi.qty), 0) as total_items_sold,
                COALESCE(SUM(oi.total_amount - oi.tax_amount), 0) as taxable_amount,
                COALESCE(SUM(oi.tax_amount), 0) as total_tax_collected,
                COALESCE(SUM(oi.total_amount), 0) as gross_sales
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            GROUP BY p.hsn_code, p.tax_percent
            ORDER BY total_tax_collected DESC
        `);

        res.json(taxByHsn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Profit & Margin Report
exports.getProfitReport = async (req, res) => {
    try {
        const [margins] = await db.query(`
            SELECT 
                p.product_id,
                p.product_name,
                c.category_name,
                p.mrp,
                p.selling_price,
                0 as cost_price,
                p.selling_price as profit_per_unit,
                100 as margin_percentage,
                COALESCE(SUM(oi.qty), 0) as units_sold,
                COALESCE(SUM(oi.qty * p.selling_price), 0) as total_profit_generated
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN order_items oi ON p.product_id = oi.product_id
            GROUP BY p.product_id
            ORDER BY total_profit_generated DESC
        `);

        res.json(margins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Customer Metrics (CLV, Top Customers, Inactive Customers, New vs Returning)
exports.getCustomerMetrics = async (req, res) => {
    try {
        const [topCustomers] = await db.query(`
            SELECT 
                c.customer_id,
                c.customer_name,
                c.mobile,
                c.email,
                COALESCE(c.loyalty_points, 0) as loyalty_points,
                COALESCE(c.wallet_balance, 0) as wallet_balance,
                COUNT(o.order_id) as total_orders,
                COALESCE(SUM(o.grand_total), 0) as total_spend,
                MAX(o.created_at) as last_order_date
            FROM customers c
            JOIN orders o ON c.customer_id = o.customer_id
            GROUP BY c.customer_id
            ORDER BY total_spend DESC
            LIMIT 10
        `);

        const [inactiveCustomers] = await db.query(`
            SELECT 
                c.customer_id,
                c.customer_name,
                c.mobile,
                c.email,
                MAX(o.created_at) as last_order_date,
                DATEDIFF(NOW(), MAX(o.created_at)) as days_inactive
            FROM customers c
            JOIN orders o ON c.customer_id = o.customer_id
            GROUP BY c.customer_id
            HAVING days_inactive >= 30
            ORDER BY days_inactive DESC
            LIMIT 10
        `);

        const [customerRatio] = await db.query(`
            SELECT 
                COUNT(DISTINCT c.customer_id) as total_customers,
                COUNT(DISTINCT CASE WHEN order_count = 1 THEN c.customer_id END) as one_time_customers,
                COUNT(DISTINCT CASE WHEN order_count > 1 THEN c.customer_id END) as repeat_customers
            FROM (
                SELECT customer_id, COUNT(order_id) as order_count
                FROM orders
                GROUP BY customer_id
            ) order_counts
            RIGHT JOIN customers c ON order_counts.customer_id = c.customer_id
        `);

        res.json({
            topCustomers,
            inactiveCustomers,
            ratio: customerRatio[0]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Cart Abandonment Report
exports.getCartAbandonment = async (req, res) => {
    try {
        const [abandonedCarts] = await db.query(`
            SELECT 
                sc.cart_id,
                c.customer_name,
                c.mobile,
                sc.created_at as cart_created_at,
                COUNT(sci.cart_item_id) as item_count,
                COALESCE(SUM(sci.qty * p.selling_price), 0) as estimated_cart_value
            FROM shopping_cart sc
            JOIN customers c ON sc.customer_id = c.customer_id
            JOIN shopping_cart_items sci ON sc.cart_id = sci.cart_id
            JOIN products p ON sci.product_id = p.product_id
            GROUP BY sc.cart_id
            ORDER BY sc.created_at DESC
        `);

        res.json(abandonedCarts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Coupon Performance Analytics
exports.getCouponAnalytics = async (req, res) => {
    try {
        const [coupons] = await db.query(`
            SELECT 
                code,
                discount_type,
                discount_value,
                usage_limit,
                used_count,
                (usage_limit - used_count) as remaining_limit,
                is_active,
                valid_from,
                valid_to
            FROM coupons
            ORDER BY used_count DESC
        `);

        res.json(coupons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get Operational & Logistics Load Reports
exports.getOperationalReports = async (req, res) => {
    try {
        const [deliverySlots] = await db.query(`
            SELECT 
                COALESCE(delivery_slot, 'Standard Express') as slot_name,
                COUNT(*) as order_count,
                COALESCE(SUM(grand_total), 0) as total_value
            FROM orders
            GROUP BY delivery_slot
            ORDER BY order_count DESC
        `);

        let inventoryLogs = [];
        try {
            const [logs] = await db.query(`
                SELECT 
                    il.log_id,
                    p.product_name,
                    il.change_type,
                    il.qty_change,
                    il.notes,
                    il.created_at
                FROM inventory_logs il
                JOIN products p ON il.product_id = p.product_id
                ORDER BY il.created_at DESC
                LIMIT 20
            `);
            inventoryLogs = logs;
        } catch (e) {
            inventoryLogs = [];
        }

        res.json({
            deliverySlots,
            inventoryLogs
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


