# StockMaster IMS

A minimalist, conventional inventory management web application built with **Node.js**, **Express.js**, **MySQL 8**, and **Vanilla HTML/CSS/JavaScript**.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8 (`mysql2` connection pool)
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Configuration**: `dotenv`

---

## Directory Structure

```
stockmaster-ims/
├── config/
│   └── database.js          # MySQL connection pool & query helpers
├── database/
│   ├── procedures.sql       # Stored procedures for transaction operations
│   ├── schema.sql           # Relational tables, constraints, and default roles
│   └── views.sql            # Views for stock aggregation & KPI metrics
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── public/
│   ├── css/
│   │   └── style.css        # Application stylesheet
│   ├── js/
│   │   ├── api.js           # Fetch API helpers & token storage
│   │   ├── auth.js          # Auth page controller
│   │   ├── dashboard.js     # Dashboard metrics & activity loader
│   │   └── theme.js         # Toast notifications & UI interactions
│   └── pages/
│       ├── adjustments.html # Stock adjustments
│       ├── dashboard.html   # Main KPI dashboard
│       ├── deliveries.html  # Outbound delivery orders
│       ├── login.html       # Sign in, sign up, password recovery
│       ├── movements.html   # Stock audit trail
│       ├── products.html    # Product inventory catalog
│       ├── receipts.html    # Inbound supplier receipts
│       ├── settings.html    # Warehouse, category, and profile settings
│       └── transfers.html   # Internal stock transfers
├── routes/
│   ├── adjustments.js       # Stock adjustment endpoints
│   ├── auth.js              # Authentication endpoints
│   ├── dashboard.js         # Dashboard stats & activity endpoints
│   ├── deliveries.js        # Delivery order endpoints
│   ├── products.js          # Product catalog & category endpoints
│   ├── receipts.js          # Supplier receipt endpoints
│   └── transfers.js         # Internal transfer endpoints
├── scripts/
│   └── initDb.js            # Database setup & sample data seeding
├── .env.example             # Environment variable template
├── .gitignore
├── LICENSE                  # MIT License
├── package.json
├── README.md
└── server.js                # Express entry point
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL Server](https://dev.mysql.com/downloads/) (v8.0+)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy the sample environment file and configure your MySQL credentials:
```bash
cp .env.example .env
```
Edit `.env` with your database password:
```ini
SECRET_KEY=your-secret-key-here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockmaster
DB_USER=root
DB_PASSWORD=your_mysql_password
PORT=5000
NODE_ENV=development
```

### 3. Initialize Database
Ensure MySQL is running and the database `stockmaster` exists (or create it: `CREATE DATABASE stockmaster;`). Then run:
```bash
npm run init-db
```
This applies `schema.sql`, `procedures.sql`, `views.sql`, and seeds initial data (warehouses, locations, categories, and default admin user).

**Default Admin Credentials:**
- Email: `admin@stockmaster.com`
- Password: `admin123`

### 4. Run Application
```bash
# Production / standard start
npm start

# Development with auto-restart
npm run dev
```

Open `http://localhost:5000` in your browser.
