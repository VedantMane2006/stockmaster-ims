# StockMaster IMS

A minimalist, conventional Inventory Management System built for a student project. Demonstrates a full-stack CRUD application with role-based access control, atomic database transactions, and a multi-page frontend — all without any frameworks.

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | HTML5, CSS3, Vanilla JavaScript     |
| Backend        | Node.js v16+, Express.js            |
| Database       | MySQL 8.0+                          |
| Auth           | JWT (`jsonwebtoken`) + `bcryptjs`   |
| Configuration  | `dotenv`                            |
| Dev Server     | `nodemon`                           |

---

## Directory Structure

```
stockmaster-ims/
├── config/
│   └── database.js          # MySQL connection pool & query helpers
├── database/
│   ├── procedures.sql       # Stored procedures for atomic inventory operations
│   ├── schema.sql           # All tables, constraints, and default roles
│   ├── seed.sql             # Standalone seed file (used by init-db script)
│   └── views.sql            # SQL views for KPIs, audit logs, and aggregations
├── middleware/
│   └── auth.js              # JWT authentication + role-based authorization
├── public/
│   ├── css/
│   │   └── style.css        # Application stylesheet
│   ├── js/
│   │   ├── api.js           # Centralized fetch wrapper + all API helper functions
│   │   ├── auth.js          # Login / register / password reset page controller
│   │   ├── dashboard.js     # Dashboard metrics & activity feed loader
│   │   └── theme.js         # Toast notifications, modal helpers, sidebar RBAC
│   └── pages/
│       ├── about.html       # Application guide and role descriptions
│       ├── adjustments.html # Stock adjustment (physical count corrections)
│       ├── dashboard.html   # Main KPI dashboard
│       ├── deliveries.html  # Outbound customer delivery orders
│       ├── employees.html   # User/employee management (Admin only)
│       ├── login.html       # Sign in, sign up, password recovery
│       ├── movements.html   # Immutable stock audit trail
│       ├── products.html    # Product catalog & inventory by location
│       ├── receipts.html    # Inbound supplier receipts
│       ├── settings.html    # Warehouses, locations, categories & profile
│       └── transfers.html   # Internal warehouse-to-warehouse stock transfers
├── routes/
│   ├── adjustments.js       # POST /adjustments
│   ├── auth.js              # POST /auth/login, /register, /forgot-password, etc.
│   ├── dashboard.js         # GET /dashboard/kpis, /warehouses, /locations
│   ├── deliveries.js        # CRUD + lifecycle for delivery orders
│   ├── products.js          # CRUD for products and categories
│   ├── receipts.js          # CRUD + lifecycle for supplier receipts
│   ├── transfers.js         # POST /transfers
│   └── users.js             # Admin-only user management (GET/POST/PUT /users)
├── scripts/
│   └── initDb.js            # One-time database setup & sample data seeding
├── .env.example             # Environment variable template — copy this to .env
├── .gitignore
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── server.js                # Express entry point — start here
```

---

## Dependencies

**Runtime:**
- `express` — HTTP server and routing
- `mysql2` — MySQL client with Promise support and connection pooling
- `jsonwebtoken` — JWT generation and verification
- `bcryptjs` — Password hashing
- `cors` — Cross-origin resource sharing headers
- `dotenv` — Load `.env` file into `process.env`

**Development only:**
- `nodemon` — Auto-restart server on file changes

---

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- [MySQL Server](https://dev.mysql.com/downloads/) v8.0 or higher

### 1. Clone and Install
```bash
git clone <repository-url>
cd stockmaster-ims
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```
Open `.env` and set your MySQL credentials:
```ini
SECRET_KEY=pick-a-long-random-string
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockmaster
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=5000
NODE_ENV=development
```

---

## Database Setup

### 1. Create the database in MySQL
```sql
CREATE DATABASE stockmaster;
```

### 2. Run the init script
This creates all tables, stored procedures, views, and seeds the initial admin user and sample warehouses/locations:
```bash
npm run init-db
```

**Default Admin Credentials:**
| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@stockmaster.com`   |
| Password | `admin123`                |

> **Note:** Change the admin password immediately after first login via **Settings → Change Password**.

---

## How to Start the Application

```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

Then open: **http://localhost:5000**

---

## Major Features

| Feature                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| **Authentication**       | JWT-based login/logout with password change and OTP-based password reset    |
| **Role-Based Access**    | 4 roles: `ADMIN`, `MANAGER`, `INVENTORY_CLERK`, `WAREHOUSE_WORKER`          |
| **Product Management**   | Create/edit products, categories, tags, and view stock by warehouse location |
| **Receipts (Inbound)**   | Full lifecycle: DRAFT → WAITING → READY → DONE with delayed tracking        |
| **Deliveries (Outbound)**| Full lifecycle: DRAFT → WAITING → READY → DONE with delayed tracking        |
| **Transfers**            | Atomic stock moves between warehouse locations                              |
| **Adjustments**          | Correct discrepancies with reason codes (DAMAGED, LOST, FOUND, etc.)       |
| **Audit Trail**          | Immutable `stock_movements` log for every inventory change                  |
| **Employee Management**  | Admin can create, activate/deactivate, and re-assign roles to users         |
| **Dashboard KPIs**       | Live summary of stock levels, pending orders, and recent activity           |
| **About Page**           | Built-in guide explaining each module and each user role                    |

---

## Known Limitations

- **No email delivery**: The forgot-password OTP is printed to the server console (`[DEV ONLY]` log) instead of being emailed. In production, integrate an email service such as Nodemailer + SendGrid.
- **No file uploads**: Product images are not supported.
- **Single database**: No replication or failover. Suitable for a single-instance deployment only.
- **No automated tests**: There are no unit or integration tests. The application was validated manually through the RBAC test plan.
- **Hard-coded port**: The port defaults to `5000`. Change via the `PORT` environment variable.
- **OTP brute-force**: The OTP reset flow has no rate limiting or attempt lockout. This is acceptable for a student project but not for production.
