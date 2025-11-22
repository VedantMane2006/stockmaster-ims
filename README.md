# StockMaster - Inventory Management System

A modular, real-time inventory management system built with Node.js, Express.js and MySQL.

## Features
- Real-time inventory tracking
- Multi-warehouse support
- Receipt & delivery management
- Internal transfers
- Stock adjustments
- Low stock alerts
- Comprehensive audit trail

## Tech Stack
- Backend: Node.js + Express.js
- Database: MySQL 8.0
- Frontend: HTML5, CSS3, Vanilla JavaScript
- UI Framework: Custom CSS (Responsive)

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+

### Installation
1. Install dependencies: `npm install`
2. Configure database in `.env`
3. Initialize database: `npm run init-db`
4. Run application: `npm start`

## Project Structure
```
StockMaster/
├── app.py                 # Main Flask application
├── config.py              # Configuration
├── requirements.txt       # Python dependencies
├── database/
│   ├── schema_mysql.sql      # MySQL database schema
│   ├── procedures_mysql.sql  # MySQL stored procedures
│   └── views_mysql.sql       # MySQL database views
├── backend/
│   ├── models.py         # Database models
│   ├── auth.py           # Authentication logic
│   └── routes/
│       ├── products.py
│       ├── receipts.py
│       ├── deliveries.py
│       ├── transfers.py
│       └── adjustments.py
└── frontend/
    ├── static/
    │   ├── css/
    │   └── js/
    └── templates/
        ├── login.html
        ├── dashboard.html
        └── ...
```
