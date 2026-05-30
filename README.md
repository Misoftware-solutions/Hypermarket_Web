# Hypermarket Web Application

A full-stack Hypermarket Web Application featuring a React/Vite front-end client and a Node.js/Express API back-end server with a MySQL database.

---

## 📂 Directory Structure

The repository is structured as a monorepo consisting of:

```text
Web_hypermarket/
├── client/                     # Frontend client React application (Vite + TypeScript)
│   ├── public/                 # Static assets
│   ├── src/                    # Source files (components, contexts, pages, hooks, utils, services)
│   ├── index.html              # HTML entry point
│   ├── vite.config.ts          # Vite configuration
│   └── tsconfig.json           # TypeScript configuration
├── server/                     # Backend API server (Express.js)
│   ├── database/               # SQL setup files
│   │   └── setup.sql           # Database schema initialization script
│   ├── src/                    # Controllers, models, routes, and configs
│   ├── index.js                # Server entry point
│   ├── .env.example            # Environment variables example configuration
│   └── package.json            # Node.js dependencies & scripts
├── README.md                   # Project documentation
└── .gitignore                  # Git ignore files definition
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MySQL Database](https://dev.mysql.com/downloads/)

---

### 1. Database Setup
1. Open your MySQL client/terminal.
2. Create a new database:
   ```sql
   CREATE DATABASE supermarket_erp;
   ```
3. Import the database schema from the `server/database/setup.sql` file:
   ```bash
   mysql -u root -p supermarket_erp < server/database/setup.sql
   ```

---

### 2. Backend Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your MySQL database configuration:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=supermarket_erp
   ```
5. Start the server:
   - For production / normal run:
     ```bash
     npm start
     ```
   - For development (runs with nodemon):
     ```bash
     npm run dev
     ```
   The backend API will be running at `http://localhost:5000`.

---

### 3. Frontend Client Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will be accessible at the URL shown in your console (usually `http://localhost:5173` or similar).

---

## 🚀 Key Features and Technologies

- **Frontend**:
  - React (v19)
  - TypeScript
  - Vite for fast tooling
  - Ant Design (`antd`) for modern UI components
  - Bootstrap (`react-bootstrap`) for responsive layouts
  - Lucide icons (`lucide-react`)
  - Axios for HTTP client operations
  - React Router DOM for routing and navigation

- **Backend**:
  - Node.js & Express.js
  - MySQL database integration via `mysql2`
  - Authentication with `bcryptjs` and `jsonwebtoken`
  - CORS-enabled for API security
  - Configured with `dotenv` for environment management
