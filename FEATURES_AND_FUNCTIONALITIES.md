# Hypermarket Web Application — Features & Functionalities Specification

## 📌 Executive Overview

The **Hypermarket Web Application** is a full-stack, enterprise-grade e-commerce and retail management platform built with a modern decoupled architecture:
- **Frontend Client**: React 19, TypeScript, Vite, Ant Design (`antd`), React-Bootstrap, Lucide Icons, and Axios.
- **Backend API**: Node.js, Express.js REST API with JWT authentication and middleware security.
- **Database**: MySQL (`supermarket_erp`) relational database with full transaction integrity, inventory auto-deduction, and relational tables.

---

## 🏗️ Architecture & Module Breakdown

The system is split into two primary domain portals:
1. **Storefront / E-Commerce Customer Portal**: Responsive online retail store for shoppers.
2. **Admin & ERP Operations Portal**: Management dashboard for inventory, category hierarchy, orders, banners, metrics, and customer administration.

---

## 🛍️ Customer Storefront Portal (Features & Functionalities)

### 1. Dual-Mode Authentication & User Accounts
- **Mobile OTP Authentication**:
  - Direct 10-digit mobile number authentication with OTP verification.
  - Integrated via SimpApp SMS gateway backend service.
  - Includes 60-second timer rate-limiting to prevent OTP spam requests.
- **Email & Password Authentication**:
  - Secure registration and login using salted `bcryptjs` password hashing.
  - JWT token generation and storage for persistent session security.
  - Interactive "Forgot Password" reset flow.
- **Customer Profile & Address Management**:
  - Profile overview with loyalty points and digital wallet balance tracking.
  - Saved delivery addresses management (Home, Work, Other) with default designation.

### 2. Product Discovery & Catalog Browsing
- **Interactive Homepage & Dynamic Promotional Banners**:
  - Top slider banners with link redirection, priority ordering, active dates, and expiration rules.
  - Featured products grid, trending categories, and top brands showcase.
- **Advanced Filtering & Search**:
  - Search auto-suggestions and live filter by category, sub-category, brand, price range, and in-stock status.
  - Sorting by popularity, price (low-to-high / high-to-low), and newest arrivals.
- **Product Detail View**:
  - High-resolution image galleries and primary image toggling.
  - Unit sizes and variants display (e.g., `500g`, `1L`, `1kg`, `Pack of 6`).
  - MRP vs. Selling Price calculation highlighting percentage discounts and savings.
  - Real-time stock status indicator (In-Stock / Out-of-Stock).

### 3. Shopping Cart & Checkout Operations
- **Real-Time Shopping Cart**:
  - Add to cart, quantity adjustments (`+` / `-`), and single item deletion.
  - Persistent cart synced with backend user database sessions.
- **Streamlined Checkout Flow**:
  - Delivery address selector with instant address addition during checkout.
  - Preferred delivery slot selection (Morning, Afternoon, Evening).
  - Payment gateway options: Cash on Delivery (COD), UPI / Wallet, Credit/Debit Cards.
  - Subtotal, tax calculation, delivery fee rules, and dynamic grand total breakdown.
- **Inventory Deductions & Order Creation**:
  - Automated transactional inventory deduction upon checkout completion.
  - Automatic active cart clearing upon order placement.

### 4. Order Tracking & Customer Service
- **Order History**:
  - Comprehensive list of past and active orders with date, status, items summary, and total cost.
- **Real-Time Order Tracking**:
  - Visual status progress bar: `Placed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered` / `Cancelled`.
  - Itemized receipt breakdown and delivery details.
- **Header Alert Badges**:
  - Dynamic notification badge in header updating users on active order state changes.

---

## 🛠️ Admin & ERP Management Portal (Features & Functionalities)

### 1. Operations Dashboard & Analytics
- **Executive Summary Metrics**:
  - Real-time KPIs for Total Sales, Daily Orders, Active Customers, and Total Products.
  - Sales performance graphs and revenue charts.
- **Stock Alert Panel**:
  - Automated low-stock indicators warning administrators when inventory falls below designated threshold levels.

### 2. Product & Catalog Management
- **Smart Product Management**:
  - Create, update, and toggle active status for catalog items.
  - Smart Autocomplete search on product name input that auto-populates fields and transitions existing items into Edit mode.
  - Product field configuration: Name, Slug, Category, Brand, Unit (e.g., kg, L, pcs), MRP, Selling Price, Tax Percentage (GST/VAT), HSN Code, Product Specifications & Size (`size`), Description, and Featured flag.
- **Category & Sub-Category Hierarchy**:
  - Multi-level parent/child category management with sort order control and category image URL attachment.
- **Brand Management**:
  - Brand repository listing with logo URLs and active toggling.

### 3. Inventory & Stock Control
- **Real-time Inventory Monitor**:
  - Live stock table listing available quantity, reserved quantity, and threshold warnings.
  - Instant stock replenishment and adjustment tools.

### 4. Order Processing & Logistics Management
- **Order Lifecycle Management**:
  - Master order table with filtering by order status (`Placed`, `Processing`, `Packed`, `Dispatched`, `Delivered`, `Cancelled`).
  - Order status updates triggering instant customer notifications.
  - Detailed view of customer details, items ordered, payment status, and shipping destination.

### 5. Banner & Promotional Marketing Management
- **Banner Configuration**:
  - Image upload/URL link, title, subtitle, target redirection links.
  - Priority scoring to control banner slide order on the storefront.
  - Scheduling start and end dates with active status toggles.

### 6. Customer & Access Management
- **Customer CRM Directory**:
  - Detailed list of registered shoppers, contact info, total orders placed, wallet balance, and loyalty points.
- **Role-Based Access Control (RBAC)**:
  - Role definition (Admin, Manager, Staff) securing backend API routes via middleware token authorization.

---

## 🗄️ Database Schema & Data Models

| Table Name | Description | Key Attributes |
|---|---|---|
| `categories` | Product classification hierarchy | `category_id`, `category_name`, `parent_id`, `image_url`, `sort_order` |
| `brands` | Product brand metadata | `brand_id`, `brand_name`, `logo_url`, `is_active` |
| `units` | Measurement units | `unit_id`, `unit_name` (kg, gm, liter, pcs, etc.) |
| `products` | Core catalog specifications | `product_id`, `product_name`, `category_id`, `brand_id`, `mrp`, `selling_price`, `size`, `tax_percent` |
| `inventory` | Stock tracking & threshold monitoring | `product_id`, `available_qty`, `reserved_qty`, `low_stock_threshold` |
| `customers` | Shopper accounts & digital wallets | `customer_id`, `customer_name`, `mobile`, `email`, `loyalty_points`, `wallet_balance` |
| `orders` | Sales transactions | `order_id`, `order_number`, `customer_id`, `order_status`, `payment_method`, `grand_total` |
| `order_items` | Order line items breakdown | `order_item_id`, `order_id`, `product_id`, `qty`, `unit_price`, `total_amount` |
| `banners` | Storefront banner sliders | `banner_id`, `title`, `image_url`, `priority`, `start_date`, `end_date`, `is_active` |
| `otp_verifications` | Mobile SMS login OTP records | `id`, `mobile`, `otp_code`, `expires_at`, `is_verified` |

---

## 🔒 Security & Technical Governance

1. **Authentication**: JWT token validation on protected customer and admin routes.
2. **Password Security**: Standard bcrypt salt & hash algorithm.
3. **Data Sanitization & Integrity**: Relational foreign key constraints and SQL parameterization via `mysql2`.
4. **Rate Limiting**: Cooldown enforcement on OTP generation endpoints.
5. **CORS & Environment Setup**: Strictly configured cross-origin resource sharing and `.env` isolation.
