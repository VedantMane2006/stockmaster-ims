# 🚀 How to Run StockMaster

You have **3 options** to run StockMaster. Choose the one that works best for you:

---

## ⭐ OPTION 1: Docker (RECOMMENDED - Easiest!)

**Best for:** Everyone, especially if you don't want to install Python and MySQL manually.

### What you need:
- Docker Desktop only

### Steps:
1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer
   - Open Docker Desktop and wait for it to start

2. **Run StockMaster**
   ```powershell
   cd path\to\StockMaster
   docker-compose up --build
   ```

3. **Access the app**
   - Open browser: http://localhost:5000
   - Login: admin@stockmaster.com / admin123

**Full guide:** See `MYSQL_SETUP.md`

---

## 📦 OPTION 2: Manual Installation (Windows)

**Best for:** If you want full control or already have Python/MySQL installed.

### What you need:
- Python 3.8+ 
- MySQL 8.0+

### Steps:
1. **Install Python**
   - Download from: https://www.python.org/downloads/
   - ⚠️ Check "Add Python to PATH" during installation

2. **Install MySQL**
   - Download from: https://dev.mysql.com/downloads/installer/
   - Remember the root password you set!

3. **Setup StockMaster**
   ```powershell
   cd path\to\StockMaster
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Create Database**
   - Open MySQL Workbench
   - Run: `CREATE DATABASE stockmaster;`

5. **Configure**
   ```powershell
   copy .env.example .env
   notepad .env
   ```
   - Update DB_PASSWORD with your MySQL root password

6. **Initialize & Run**
   ```powershell
   python init_db.py
   python app.py
   ```

7. **Access the app**
   - Open browser: http://localhost:5000
   - Login: admin@stockmaster.com / admin123

**Full guide:** See `MYSQL_SETUP.md`

---

## 🐧 OPTION 3: Linux/Mac Installation

### What you need:
- Python 3.8+
- PostgreSQL 12+

### Quick Setup:
```bash
# Install dependencies (Ubuntu/Debian)
sudo apt update
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib

# Setup project
cd StockMaster
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create database
sudo -u postgres psql
CREATE DATABASE stockmaster;
\q

# Configure
cp .env.example .env
nano .env  # Update DB_PASSWORD

# Initialize & Run
python init_db.py
python app.py
```

**Full guide:** See `SETUP.md`

---

## 🎯 Quick Comparison

| Method | Difficulty | Setup Time | Best For |
|--------|-----------|------------|----------|
| **Docker** | ⭐ Easy | 5 minutes | Everyone |
| **Windows Manual** | ⭐⭐ Medium | 15 minutes | Windows users with control needs |
| **Linux/Mac** | ⭐⭐ Medium | 10 minutes | Linux/Mac users |

---

## 🆘 Need Help?

### Common Issues:

**"Python not found"**
- Restart terminal after installing Python
- Make sure "Add to PATH" was checked during installation

**"Cannot connect to database"**
- Make sure PostgreSQL service is running
- Check password in `.env` file

**"Port 5000 already in use"**
- Change PORT in `.env` to 5001
- Or stop the process using port 5000

**Docker issues**
- Make sure Docker Desktop is running
- Try: `docker-compose down -v` then `docker-compose up --build`

### Still stuck?
Check the detailed guides:
- Docker: `DOCKER_SETUP.md`
- Windows: `WINDOWS_INSTALL.md`
- General: `SETUP.md`

---

## ✅ After Running

Once the application is running, you can:

1. **Login** with default credentials:
   - Email: `admin@stockmaster.com`
   - Password: `admin123`

2. **Explore the features:**
   - Dashboard with KPIs
   - Product management
   - Receipts (incoming stock)
   - Deliveries (outgoing stock)
   - Internal transfers
   - Stock adjustments
   - Movement history

3. **Create your own data:**
   - Add warehouses and locations
   - Create products
   - Process receipts and deliveries
   - Track inventory in real-time

---

## 🎉 Recommended: Start with Docker!

If you're unsure which method to use, **go with Docker**. It's the fastest and most reliable way to get StockMaster running without any installation headaches.

```powershell
# Just run these two commands:
docker-compose up --build
# Then open: http://localhost:5000
```

That's it! 🚀
