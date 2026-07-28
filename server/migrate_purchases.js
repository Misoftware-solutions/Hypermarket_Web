const db = require('./src/config/db');

async function migrate() {
    try {
        console.log('⏳ Running database migration for Suppliers & Purchase Entry tables...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS suppliers (
                supplier_id INT AUTO_INCREMENT PRIMARY KEY,
                supplier_name VARCHAR(150) NOT NULL UNIQUE,
                contact_person VARCHAR(100) NULL,
                mobile VARCHAR(20) NULL,
                email VARCHAR(100) NULL,
                address TEXT NULL,
                gst_number VARCHAR(20) NULL,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Created suppliers table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS purchase_orders (
                purchase_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                purchase_number VARCHAR(50) UNIQUE NOT NULL,
                supplier_id INT NOT NULL,
                invoice_number VARCHAR(100) NULL,
                purchase_date DATE NOT NULL,
                payment_status VARCHAR(30) DEFAULT 'Unpaid',
                payment_method VARCHAR(50) DEFAULT 'Bank',
                subtotal DECIMAL(10,2) DEFAULT 0,
                tax_amount DECIMAL(10,2) DEFAULT 0,
                discount_amount DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) DEFAULT 0,
                notes TEXT NULL,
                created_by BIGINT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
                FOREIGN KEY (created_by) REFERENCES users(user_id)
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Created purchase_orders table');

        await db.query(`
            CREATE TABLE IF NOT EXISTS purchase_items (
                purchase_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                purchase_id BIGINT NOT NULL,
                product_id BIGINT NOT NULL,
                qty DECIMAL(10,2) NOT NULL,
                cost_price DECIMAL(10,2) NOT NULL,
                tax_percent DECIMAL(5,2) DEFAULT 0,
                tax_amount DECIMAL(10,2) DEFAULT 0,
                total_amount DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (purchase_id) REFERENCES purchase_orders(purchase_id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(product_id)
            ) ENGINE=InnoDB;
        `);
        console.log('✅ Created purchase_items table');

        try {
            await db.query(`ALTER TABLE products ADD COLUMN cost_price DECIMAL(10,2) DEFAULT 0 AFTER unit_id`);
            console.log('✅ Added cost_price column to products table');
        } catch (e) {
            console.log('ℹ️ cost_price column already exists on products table');
        }

        // Insert sample supplier if table empty
        const [existingSuppliers] = await db.query('SELECT COUNT(*) as count FROM suppliers');
        if (existingSuppliers[0].count === 0) {
            await db.query(`
                INSERT INTO suppliers (supplier_name, contact_person, mobile, email, address, gst_number) VALUES
                ('Metro Cash & Carry India', 'Ramesh Kumar', '9812345670', 'sales@metrocash.in', 'Koramangala Industrial Layout, Bangalore', '29AAAAA0000A1Z5'),
                ('Reliable Consumer Goods Ltd', 'Suresh Patel', '9812345671', 'info@reliablecg.com', 'GST Road, Guindy, Chennai', '33BBBBA1111B2Z6')
            `);
            console.log('✅ Inserted sample suppliers');
        }

        console.log('🎉 Database migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
