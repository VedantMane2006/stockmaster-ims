# StockMaster Setup Guide

## Prerequisites

1. **Python 3.8+**
   - Download from https://www.python.org/downloads/
   - Verify: `python --version`

2. **MySQL 8.0+**
   - Download from https://dev.mysql.com/downloads/installer/
   - Verify: `mysql --version`

OR just use Docker! See `START_HERE.md`

## 📦 Installation Steps

### 1. Install Prerequisites
- Python 3.8+: https://www.python.org/downloads/
- MySQL 8.0+: https://dev.mysql.com/downloads/installer/

### 2. Clone/Download Project
```bash
cd StockMaster
```

### 3. Create Virtual Environment
```bash
python -m venv venv
```

### 4. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 5. Install Dependencies
```bash
pip install -r requirements.txt
```

### 6. Setup MySQL Database

**Create Database:**
```sql
CREATE DATABASE stockmaster;
```

**Using command line:**
```bash
mysql -u root -p
CREATE DATABASE stockmaster;
EXIT;
```

**Or using MySQL Workbench:**
- Open MySQL Workbench
- Connect to localhost
- Run: `CREATE DATABASE stockmaster;`

### 7. Configure Environment

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` with your database credentials:
```
SECRET_KEY=your-secret-key-here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stockmaster
DB_USER=root
DB_PASSWORD=your-mysql-root-password
DEBUG=True
PORT=5000
```

### 8. Initialize Database

Run the initialization script:
```bash
python init_db.py
```

This will:
- Create all tables
- Set up stored procedures
- Create views
- Insert sample data
- Create default admin user

**Default Admin Credentials:**
- Email: admin@stockmaster.com
- Password: admin123

### 9. Run Application

```bash
python app.py
```

The application will start on http://localhost:5000

### 10. Access Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Testing the Application

### 1. Login
- Use default admin credentials or register a new account

### 2. Create Sample Data

**Create Warehouse:**
- Go to Settings → Warehouses
- Add a new warehouse

**Create Products:**
- Go to Products
- Add products with SKU, name, category, etc.

**Create Receipt:**
- Go to Receipts → New Receipt
- Select supplier, warehouse, location
- Add product lines
- Update status to READY
- Enter received quantities
- Validate to update stock

**Create Delivery:**
- Go to Deliveries → New Delivery
- Select customer, warehouse, location
- Add product lines
- Update status to READY
- Enter delivered quantities
- Validate to reduce stock

**Create Transfer:**
- Go to Transfers → New Transfer
- Select product, from/to locations
- Enter quantity
- Execute transfer

**Create Adjustment:**
- Go to Adjustments → New Adjustment
- Select product and location
- Enter counted quantity
- Select reason
- Submit

### 3. View Reports
- Dashboard shows KPIs and recent activity
- Move History shows all stock movements
- Low Stock alerts appear on dashboard

## Troubleshooting

### Database Connection Error
- Verify MySQL is running (check Services)
- Check credentials in `.env`
- Ensure database exists
- Try: `mysql -u root -p` to test connection

### Port Already in Use
- Change PORT in `.env` to another port (e.g., 5001)

### Module Not Found
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

### Permission Denied
- On Windows, run terminal as Administrator
- On Linux/Mac, check file permissions

## Database Management

### Backup Database
```bash
mysqldump -u root -p stockmaster > backup.sql
```

### Restore Database
```bash
mysql -u root -p stockmaster < backup.sql
```

### Reset Database
```bash
python init_db.py
```

## Production Deployment

### Security Checklist
1. Change SECRET_KEY to a strong random value
2. Set DEBUG=False
3. Use strong database password
4. Enable HTTPS
5. Configure CORS properly
6. Set up proper firewall rules
7. Regular database backups

### Performance Optimization
1. Enable PostgreSQL query caching
2. Add more indexes if needed
3. Use connection pooling (already configured)
4. Monitor slow queries
5. Regular VACUUM and ANALYZE

## API Documentation

### Authentication
All API endpoints (except auth) require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/profile

**Dashboard:**
- GET /api/dashboard/kpis
- GET /api/dashboard/recent-activity
- GET /api/dashboard/stock-movements

**Products:**
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- GET /api/products/low-stock

**Receipts:**
- GET /api/receipts
- GET /api/receipts/:id
- POST /api/receipts
- POST /api/receipts/:id/lines
- PUT /api/receipts/:id/status
- POST /api/receipts/:id/validate

**Deliveries:**
- GET /api/deliveries
- GET /api/deliveries/:id
- POST /api/deliveries
- POST /api/deliveries/:id/lines
- PUT /api/deliveries/:id/status
- POST /api/deliveries/:id/validate

**Transfers:**
- GET /api/transfers
- GET /api/transfers/:id
- POST /api/transfers

**Adjustments:**
- GET /api/adjustments
- GET /api/adjustments/:id
- POST /api/adjustments

**Warehouses:**
- GET /api/warehouses
- GET /api/warehouses/:id/locations
- POST /api/warehouses
- POST /api/locations

## Support

For issues or questions, check:
1. Database logs
2. Application logs
3. Browser console (F12)
4. Network tab for API errors
