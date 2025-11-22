# Node.js Setup Guide for StockMaster

## Prerequisites

### Install Node.js

**Option 1: Using Official Installer (Recommended)**
1. Go to https://nodejs.org/
2. Download LTS version (18.x or 20.x)
3. Run the installer
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

**Option 2: Using winget**
```powershell
winget install OpenJS.NodeJS.LTS
```

### Install MySQL
1. Download: https://dev.mysql.com/downloads/installer/
2. Install MySQL 8.0
3. Remember your root password!

## Quick Start with Docker (Easiest!)

```powershell
cd path\to\StockMaster
docker-compose up --build
```

Open http://localhost:5000

## Manual Setup

### Step 1: Install Dependencies

```powershell
cd path\to\StockMaster
npm install
```

### Step 2: Create Database

**Using MySQL Workbench:**
- Open MySQL Workbench
- Connect to localhost
- Run: `CREATE DATABASE stockmaster;`

**Using Command Line:**
```powershell
mysql -u root -p
CREATE DATABASE stockmaster;
EXIT;
```

### Step 3: Configure Environment

```powershell
copy .env.example .env
notepad .env
```

Update these values:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockmaster
DB_USER=root
DB_PASSWORD=your_mysql_root_password
SECRET_KEY=your-random-secret-key
PORT=5000
```

### Step 4: Initialize Database

```powershell
npm run init-db
```

This will:
- Create all tables
- Set up stored procedures
- Create views
- Insert sample data
- Create admin user

### Step 5: Run Application

**Development mode (with auto-restart):**
```powershell
npm run dev
```

**Production mode:**
```powershell
npm start
```

### Step 6: Access Application

Open browser: http://localhost:5000

**Default Login:**
- Email: admin@stockmaster.com
- Password: admin123

## Available Scripts

```powershell
npm start        # Start the server
npm run dev      # Start with nodemon (auto-restart)
npm run init-db  # Initialize database
```

## Troubleshooting

### "node command not found"
- Restart terminal after installing Node.js
- Verify installation: `node --version`

### "Cannot find module"
- Run: `npm install`
- Make sure you're in the project directory

### "Can't connect to MySQL"
- Check MySQL service is running
- Verify credentials in `.env`
- Test connection: `mysql -u root -p`

### "Port 5000 already in use"
- Change PORT in `.env` to 5001 or another port
- Or stop the process using port 5000

## Project Structure

```
StockMaster/
├── server.js              # Main Express server
├── package.json           # Dependencies and scripts
├── config/
│   └── database.js       # MySQL connection pool
├── routes/               # API routes
│   ├── auth.js
│   ├── products.js
│   ├── receipts.js
│   ├── deliveries.js
│   ├── transfers.js
│   ├── adjustments.js
│   └── dashboard.js
├── middleware/
│   └── auth.js           # JWT authentication
├── scripts/
│   └── initDb.js         # Database initialization
├── database/             # SQL files
└── frontend/             # Static files
```

## Development Tips

### Auto-restart on changes
```powershell
npm run dev
```

### View logs
The server logs all requests and errors to console.

### Database changes
After modifying SQL files, run:
```powershell
npm run init-db
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `SECRET_KEY`
3. Use a strong MySQL password
4. Enable HTTPS
5. Use a process manager like PM2:
   ```powershell
   npm install -g pm2
   pm2 start server.js --name stockmaster
   pm2 save
   pm2 startup
   ```

## API Documentation

All API endpoints require JWT authentication (except auth endpoints).

**Authentication Header:**
```
Authorization: Bearer <token>
```

**Endpoints:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/profile
- GET /api/products
- POST /api/products
- GET /api/receipts
- POST /api/receipts
- GET /api/deliveries
- POST /api/deliveries
- GET /api/transfers
- POST /api/transfers
- GET /api/adjustments
- POST /api/adjustments
- GET /api/dashboard/kpis
- GET /api/dashboard/recent-activity
- GET /api/warehouses

## Why Node.js?

✅ Faster development
✅ JavaScript everywhere (frontend + backend)
✅ Excellent async performance
✅ Large ecosystem (npm)
✅ Easy to deploy
✅ Great for real-time applications
