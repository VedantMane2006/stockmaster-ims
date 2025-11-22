# MySQL Setup Guide for StockMaster

## Prerequisites

### Install MySQL

**Option 1: Using MySQL Installer (Recommended)**
1. Go to https://dev.mysql.com/downloads/installer/
2. Download "MySQL Installer for Windows"
3. Run the installer
4. Choose "Developer Default" or "Server only"
5. Set a root password (remember this!)
6. Complete the installation

**Option 2: Using winget**
```powershell
winget install Oracle.MySQL
```

### Verify Installation
```powershell
mysql --version
```

## Quick Start with Docker (Easiest!)

If you have Docker Desktop installed:

```powershell
cd path\to\StockMaster
docker-compose up --build
```

That's it! Open http://localhost:5000

## Manual Setup

### Step 1: Create Database

**Option A: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Run this query:
   ```sql
   CREATE DATABASE stockmaster;
   ```

**Option B: Using Command Line**
```powershell
mysql -u root -p
```
Enter your password, then:
```sql
CREATE DATABASE stockmaster;
EXIT;
```

### Step 2: Configure Application

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```

2. Edit `.env`:
   ```powershell
   notepad .env
   ```

3. Update these values:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=stockmaster
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password
   ```

### Step 3: Install Python Dependencies

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Step 4: Initialize Database

```powershell
python init_db.py
```

This will:
- Create all tables
- Set up stored procedures
- Create views
- Insert sample data
- Create admin user

### Step 5: Run Application

```powershell
python app.py
```

Open browser: http://localhost:5000

**Default Login:**
- Email: admin@stockmaster.com
- Password: admin123

## Troubleshooting

### "Access denied for user 'root'"
- Check your password in `.env`
- Make sure MySQL service is running

### "Can't connect to MySQL server"
- Verify MySQL is running:
  - Open Services (Win + R, type `services.msc`)
  - Find "MySQL80" and make sure it's running

### "Unknown database 'stockmaster'"
- Create the database first (see Step 1)

### "mysql command not found"
- Add MySQL to PATH:
  - Default location: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
  - Or use MySQL Workbench instead

## Database Management

### Backup Database
```powershell
mysqldump -u root -p stockmaster > backup.sql
```

### Restore Database
```powershell
mysql -u root -p stockmaster < backup.sql
```

### Reset Database
```powershell
python init_db.py
```

## MySQL vs PostgreSQL

StockMaster now uses MySQL instead of PostgreSQL because:
- ✅ Easier to install on Windows
- ✅ Better Windows integration
- ✅ MySQL Workbench is more user-friendly
- ✅ Wider adoption and community support
- ✅ Excellent performance for this use case

All features work identically with MySQL!
