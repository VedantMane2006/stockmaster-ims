# 🚀 Super Easy Installation Guide

## Method 1: Automated Script (Recommended)

### Step 1: Install Python & PostgreSQL Automatically

1. **Right-click on PowerShell** and select **"Run as Administrator"**

2. **Navigate to StockMaster folder:**
   ```powershell
   cd path\to\StockMaster
   ```

3. **Run the installer:**
   ```powershell
   .\install_windows.ps1
   ```

   This will automatically install:
   - Python 3.12
   - PostgreSQL 16

4. **Close PowerShell and open a NEW one** (to refresh PATH)

### Step 2: Setup StockMaster

1. **Navigate to StockMaster folder:**
   ```powershell
   cd path\to\StockMaster
   ```

2. **Run setup script:**
   ```powershell
   .\setup_stockmaster.ps1
   ```

### Step 3: Configure Database

1. **Edit configuration:**
   ```powershell
   notepad .env
   ```

2. **Update this line with your PostgreSQL password:**
   ```
   DB_PASSWORD=your_postgres_password_here
   ```

3. **Save and close**

### Step 4: Create Database

**Option A: Using pgAdmin 4 (Easier)**
- Open pgAdmin 4
- Right-click "Databases" → Create → Database
- Name: `stockmaster`
- Click Save

**Option B: Using Command Line**
```powershell
psql -U postgres
CREATE DATABASE stockmaster;
\q
```

### Step 5: Initialize & Run

```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Initialize database
python init_db.py

# Run application
python app.py
```

### Step 6: Access Application

Open browser: **http://localhost:5000**

Login:
- Email: `admin@stockmaster.com`
- Password: `admin123`

---

## Method 2: Manual Installation (If scripts don't work)

### Install Python
1. Go to https://www.python.org/downloads/
2. Download Python 3.12
3. Run installer
4. ✅ **CHECK "Add Python to PATH"**
5. Click "Install Now"

### Install PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL 16
3. Run installer
4. **Remember the password you set!**
5. Install pgAdmin 4 (recommended)

### Setup StockMaster
```powershell
cd path\to\StockMaster
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
notepad .env
```

Update `.env` with your PostgreSQL password, then:

```powershell
# Create database in pgAdmin or psql
# Then:
python init_db.py
python app.py
```

---

## Method 3: Docker (Easiest - No Python/PostgreSQL needed!)

### Install Docker Desktop
1. Download: https://www.docker.com/products/docker-desktop/
2. Install and restart computer
3. Open Docker Desktop

### Run StockMaster
```powershell
cd path\to\StockMaster
docker-compose up --build
```

That's it! Open http://localhost:5000

---

## 🆘 Troubleshooting

### "Execution policy" error when running scripts
Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Python not found" after installation
- Restart your terminal
- Make sure you checked "Add to PATH" during installation

### "psql not found"
- PostgreSQL might not be in PATH
- Use pgAdmin 4 instead for database creation

### "Cannot connect to database"
- Make sure PostgreSQL service is running
- Check password in .env file
- Verify database "stockmaster" exists

### Scripts won't run
Just follow Method 2 (Manual Installation) instead

---

## 📝 Quick Reference

**Start application (after setup):**
```powershell
cd path\to\StockMaster
.\venv\Scripts\Activate.ps1
python app.py
```

**Stop application:**
Press `Ctrl + C`

**Reset database:**
```powershell
python init_db.py
```

**Access application:**
http://localhost:5000

**Default login:**
- Email: admin@stockmaster.com
- Password: admin123

---

## ✅ Recommended Path

1. Try **Method 1 (Automated Script)** first
2. If that doesn't work, use **Method 3 (Docker)**
3. Last resort: **Method 2 (Manual)**

Docker is honestly the easiest if you're okay installing one thing (Docker Desktop) instead of two (Python + PostgreSQL).
