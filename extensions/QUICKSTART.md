# 🚀 StockMaster - Quick Start Guide

## What You Need

1. **Node.js 16+** - Download from https://nodejs.org/
2. **MySQL 8.0+** - Download from https://dev.mysql.com/downloads/installer/

---

## Installation (5 Steps)

### Step 1: Install Node.js
- Go to https://nodejs.org/
- Download and install LTS version
- Verify: `node --version`

### Step 2: Install MySQL
- Go to https://dev.mysql.com/downloads/installer/
- Download MySQL Installer
- Install MySQL 8.0
- **Remember your root password!**

### Step 3: Create Database
Open MySQL Workbench or command line:
```sql
CREATE DATABASE stockmaster;
```

Or using command line:
```bash
mysql -u root -p
CREATE DATABASE stockmaster;
EXIT;
```

### Step 4: Setup Project
```bash
cd "C:\Users\Swastik Shivane\.kiro\extensions"

# Install dependencies
npm install

# Configure environment
copy .env.example .env
notepad .env
```

**Edit .env file:**
- Update `DB_PASSWORD` with your MySQL root password
- Save and close

### Step 5: Initialize & Run
```bash
# Initialize database
npm run init-db

# Start server
npm start
```

---

## Access Application

Open browser: **http://localhost:5000**

**Login:**
- Email: `admin@stockmaster.com`
- Password: `admin123`

---

## Troubleshooting

### "node not found"
- Restart terminal after installing Node.js
- Verify: `node --version`

### "mysql not found"
- Use MySQL Workbench to create database
- Or add MySQL to PATH

### "Cannot connect to database"
- Check MySQL service is running (services.msc)
- Verify password in .env file
- Test: `mysql -u root -p`

### "Port 5000 already in use"
- Change PORT in .env to 5001
- Or stop the process using port 5000

---

## Development Commands

```bash
npm start        # Start server
npm run dev      # Start with auto-restart (nodemon)
npm run init-db  # Reset database
```

---

## Next Steps

1. ✅ Login to the system
2. ✅ Create warehouses and locations
3. ✅ Add products
4. ✅ Process receipts (incoming stock)
5. ✅ Create deliveries (outgoing stock)
6. ✅ Transfer stock between locations
7. ✅ Adjust inventory counts

---

## Need Help?

- **Full Setup Guide:** See `NODE_SETUP.md`
- **General Info:** See `README.md`
- **Migration Details:** See `MIGRATION_TO_NODEJS.md`

---

## That's It! 🎉

Your inventory management system is ready to use!
