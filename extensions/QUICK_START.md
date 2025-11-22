# 🚀 StockMaster - Quick Start Guide

## ✅ What's Changed

StockMaster now uses **MySQL** instead of PostgreSQL for easier Windows installation!

All PostgreSQL files have been removed and replaced with MySQL equivalents.

---

## 🎯 Choose Your Installation Method

### Method 1: Docker (Recommended - 5 minutes)

**What you need:** Docker Desktop only

1. **Install Docker Desktop**
   - Download: https://www.docker.com/products/docker-desktop/
   - Install and restart computer
   - Open Docker Desktop

2. **Run StockMaster**
   ```powershell
   cd path\to\StockMaster
   docker-compose up --build
   ```

3. **Done!** Open http://localhost:5000
   - Login: admin@stockmaster.com / admin123

---

### Method 2: Automated Script (10 minutes)

**What you need:** Windows 10/11 with winget

1. **Run installer as Administrator**
   ```powershell
   cd path\to\StockMaster
   .\install_windows.ps1
   ```
   This installs Python and MySQL automatically.

2. **Close and reopen PowerShell, then:**
   ```powershell
   cd path\to\StockMaster
   .\setup_stockmaster.ps1
   ```

3. **Configure database**
   ```powershell
   notepad .env
   ```
   Update `DB_PASSWORD` with your MySQL root password

4. **Create database**
   ```powershell
   mysql -u root -p
   CREATE DATABASE stockmaster;
   EXIT;
   ```

5. **Initialize and run**
   ```powershell
   python init_db.py
   python app.py
   ```

6. **Done!** Open http://localhost:5000

---

### Method 3: Manual Installation (15 minutes)

**Step 1: Install Python**
- Download: https://www.python.org/downloads/
- ⚠️ Check "Add Python to PATH"
- Install

**Step 2: Install MySQL**
- Download: https://dev.mysql.com/downloads/installer/
- Choose "Developer Default"
- Set root password (remember it!)
- Install

**Step 3: Setup Project**
```powershell
cd path\to\StockMaster
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Step 4: Configure**
```powershell
copy .env.example .env
notepad .env
```
Update `DB_PASSWORD` with your MySQL root password

**Step 5: Create Database**

Using MySQL Workbench:
- Open MySQL Workbench
- Connect to localhost
- Run: `CREATE DATABASE stockmaster;`

OR using command line:
```powershell
mysql -u root -p
CREATE DATABASE stockmaster;
EXIT;
```

**Step 6: Initialize & Run**
```powershell
python init_db.py
python app.py
```

**Step 7: Access**
Open http://localhost:5000
- Login: admin@stockmaster.com / admin123

---

## 📁 Database Files

The following MySQL files are included:
- `database/schema_mysql.sql` - Tables, indexes, constraints
- `database/procedures_mysql.sql` - Stored procedures
- `database/views_mysql.sql` - Optimized views

All PostgreSQL files have been removed.

---

## 🆘 Troubleshooting

### "Python not found"
- Restart terminal after installing Python
- Make sure "Add to PATH" was checked

### "MySQL not found"
- Add to PATH: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
- Or use MySQL Workbench

### "Can't connect to MySQL"
- Check MySQL service is running (services.msc)
- Verify password in `.env`
- Test: `mysql -u root -p`

### "Database doesn't exist"
- Create it: `CREATE DATABASE stockmaster;`

### Docker issues
- Make sure Docker Desktop is running
- Try: `docker-compose down -v` then `docker-compose up --build`

---

## 🎉 Recommended: Use Docker!

Docker is the easiest method - just install Docker Desktop and run:
```powershell
docker-compose up --build
```

Everything (Python, MySQL, dependencies) is handled automatically!

---

## 📚 More Help

- **MySQL Setup:** See `MYSQL_SETUP.md`
- **General Setup:** See `SETUP.md`
- **All Options:** See `START_HERE.md`
- **Easy Install:** See `EASY_INSTALL.md`

---

## ✨ Features

Once running, you can:
- ✅ Manage products and categories
- ✅ Process incoming receipts
- ✅ Handle outgoing deliveries
- ✅ Transfer stock between locations
- ✅ Adjust inventory counts
- ✅ View real-time dashboard
- ✅ Track all stock movements
- ✅ Get low stock alerts

Default login: admin@stockmaster.com / admin123
