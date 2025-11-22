# 🔄 StockMaster - Python/Flask to Node.js/Express Migration

## ✅ Migration Complete!

StockMaster has been **completely migrated from Python/Flask to Node.js/Express.js**.

---

## 📁 New File Structure

### Node.js Backend Files (NEW)
- ✅ `server.js` - Main Express application
- ✅ `package.json` - Node.js dependencies and scripts
- ✅ `config/database.js` - MySQL connection pool
- ✅ `routes/auth.js` - Authentication routes
- ✅ `routes/products.js` - Product management
- ✅ `routes/receipts.js` - Receipt processing
- ✅ `routes/deliveries.js` - Delivery orders
- ✅ `routes/transfers.js` - Internal transfers
- ✅ `routes/adjustments.js` - Stock adjustments
- ✅ `routes/dashboard.js` - Dashboard & KPIs
- ✅ `middleware/auth.js` - JWT authentication
- ✅ `scripts/initDb.js` - Database initialization
- ✅ `.gitignore` - Node.js specific

### Python/Flask Files (DELETED)
- ❌ `app.py`
- ❌ `config.py`
- ❌ `requirements.txt`
- ❌ `init_db.py`
- ❌ `backend/db.py`
- ❌ `backend/auth.py`
- ❌ `backend/middleware.py`
- ❌ `backend/routes/*.py` (all Python routes)

### Unchanged Files
- ✅ `database/schema_mysql.sql` - Same MySQL schema
- ✅ `database/procedures_mysql.sql` - Same stored procedures
- ✅ `database/views_mysql.sql` - Same views
- ✅ `frontend/` - All frontend files unchanged
- ✅ `docker-compose.yml` - Updated for Node.js
- ✅ `Dockerfile` - Updated for Node.js

---

## 🔑 Key Changes

### Dependencies
**Before (Python):**
```
Flask
psycopg2-binary → mysql-connector-python
python-dotenv
PyJWT
bcrypt
```

**After (Node.js):**
```
express
mysql2
dotenv
jsonwebtoken
bcryptjs
cors
```

### Running the Application
**Before (Python):**
```bash
pip install -r requirements.txt
python init_db.py
python app.py
```

**After (Node.js):**
```bash
npm install
npm run init-db
npm start
```

### Environment Variables
**Before:**
- Used `config.py` for configuration

**After:**
- Uses `.env` file with `dotenv` package

### Authentication
**Before (Python):**
```python
from flask import request
token = request.headers.get('Authorization')
```

**After (Node.js):**
```javascript
const authHeader = req.headers.authorization;
const token = authHeader.split(' ')[1];
```

### Database Queries
**Before (Python):**
```python
cursor.execute(query, params)
result = cursor.fetchall()
```

**After (Node.js):**
```javascript
const [rows] = await pool.execute(query, params);
```

---

## 🚀 How to Run

### Installation

**Step 1: Install Node.js**
- Download from: https://nodejs.org/
- Install LTS version (18.x or 20.x)

**Step 2: Install MySQL**
- Download from: https://dev.mysql.com/downloads/installer/
- Install MySQL 8.0

**Step 3: Setup Project**
```bash
cd StockMaster
npm install
```

**Step 4: Configure**
```bash
copy .env.example .env
notepad .env
```
Update `DB_PASSWORD` with your MySQL root password

**Step 5: Initialize Database**
```bash
npm run init-db
```

**Step 6: Run Application**
```bash
npm start
```

**Step 7: Access**
- Open: http://localhost:5000
- Login: admin@stockmaster.com / admin123

---

## 📊 Comparison

| Feature | Python/Flask | Node.js/Express |
|---------|-------------|-----------------|
| **Language** | Python | JavaScript |
| **Runtime** | Python 3.8+ | Node.js 16+ |
| **Package Manager** | pip | npm |
| **Async** | asyncio | Native async/await |
| **Performance** | Good | Excellent |
| **Ecosystem** | PyPI | npm (larger) |
| **Learning Curve** | Medium | Easy (if you know JS) |
| **Deployment** | Gunicorn/uWSGI | PM2/Forever |

---

## ✨ Benefits of Node.js

1. **JavaScript Everywhere** - Same language for frontend and backend
2. **Faster Development** - npm has more packages
3. **Better Async** - Native async/await support
4. **Real-time Ready** - Perfect for WebSockets if needed later
5. **Easy Deployment** - Simple to deploy on any platform
6. **Active Community** - Huge ecosystem and support

---

## 📚 Documentation

- **Quick Start:** See `NODE_SETUP.md`
- **General Setup:** See `SETUP.md`
- **Docker Setup:** See `docker-compose.yml`
- **API Routes:** See individual route files in `routes/`

---

## 🎯 All Features Work Identically

No functionality was lost in the migration:
- ✅ User authentication (JWT)
- ✅ Product management
- ✅ Receipt processing
- ✅ Delivery orders
- ✅ Internal transfers
- ✅ Stock adjustments
- ✅ Dashboard & KPIs
- ✅ Real-time data
- ✅ Stored procedures
- ✅ Database views
- ✅ All CRUD operations

---

## 🔧 Development

**Start development server (auto-restart):**
```bash
npm run dev
```

**Initialize database:**
```bash
npm run init-db
```

**Start production server:**
```bash
npm start
```

---

## ✅ Migration Complete!

All Python/Flask code has been removed and replaced with Node.js/Express.js equivalents. The application is ready to run!

**Next Steps:**
1. Install Node.js and MySQL (or use Docker)
2. Run `npm install`
3. Configure `.env`
4. Run `npm run init-db`
5. Run `npm start`
6. Open http://localhost:5000
