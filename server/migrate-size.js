const db = require('./src/config/db');

async function run() {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM products LIKE 'size'");
    if (columns.length === 0) {
      await db.query("ALTER TABLE products ADD COLUMN size VARCHAR(50) NULL AFTER unit_id");
      console.log("Column 'size' added to products table successfully!");
    } else {
      console.log("Column 'size' already exists in products table.");
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

run();
