# StockMaster API Endpoints

## ✅ All Endpoints Verified and Working

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/profile` - Get current user profile

### Dashboard
- `GET /api/dashboard/kpis` - Get dashboard KPIs (total products, low stock, etc.)
- `GET /api/dashboard/recent-activity` - Get recent activity feed
- `GET /api/dashboard/stock-movements` - Get stock movement history

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/low-stock` - Get low stock products ⚠️ MUST be before /:id
- `GET /api/products/:id` - Get single product details
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

### Warehouses & Locations
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/:id/locations` - Get locations for a warehouse
- `POST /api/warehouses` - Create new warehouse
- `POST /api/locations` - Create new location

### Receipts (Incoming Goods)
- `GET /api/receipts` - Get all receipts
- `GET /api/receipts/:id` - Get receipt details
- `POST /api/receipts` - Create new receipt
- `POST /api/receipts/:id/lines` - Add line to receipt
- `PUT /api/receipts/:id/status` - Update receipt status
- `PUT /api/receipts/:id/lines/:lineId/receive` - Update received quantity
- `POST /api/receipts/:id/validate` - Validate and complete receipt

### Deliveries (Outgoing Goods)
- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/:id` - Get delivery details
- `POST /api/deliveries` - Create new delivery
- `POST /api/deliveries/:id/lines` - Add line to delivery
- `PUT /api/deliveries/:id/status` - Update delivery status
- `PUT /api/deliveries/:id/lines/:lineId/deliver` - Update delivered quantity
- `POST /api/deliveries/:id/validate` - Validate and complete delivery

### Transfers
- `GET /api/transfers` - Get all transfers
- `GET /api/transfers/:id` - Get transfer details
- `POST /api/transfers` - Create new transfer

### Adjustments
- `GET /api/adjustments` - Get all adjustments
- `GET /api/adjustments/:id` - Get adjustment details
- `POST /api/adjustments` - Create new adjustment

## 🔐 Authentication

All endpoints (except `/auth/login` and `/auth/register`) require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## 🐛 Common Issues & Solutions

### Issue: 404 Error on `/api/products/low-stock`

**Cause**: Route order matters in Express! If `/products/:id` comes before `/products/low-stock`, Express treats "low-stock" as an ID parameter.

**Solution**: Always define specific routes BEFORE parameterized routes:
```javascript
// ✅ CORRECT ORDER
router.get('/products/low-stock', handler);  // Specific route first
router.get('/products/:id', handler);        // Parameterized route second

// ❌ WRONG ORDER
router.get('/products/:id', handler);        // This catches everything!
router.get('/products/low-stock', handler);  // Never reached
```

### Issue: "Product not found" error for valid endpoints

**Cause**: Generic error handling that doesn't distinguish between different HTTP status codes.

**Solution**: Improved error handling in `api.js`:
```javascript
if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
}
```

## 🧪 Testing

Run diagnostics to verify all endpoints:
```bash
node scripts/diagnostics.js
```

Run endpoint tests:
```bash
node scripts/testEndpoints.js
```

## 📊 Database Views

The following views are used by the API:
- `v_dashboard_kpis` - Dashboard statistics
- `v_products_with_stock` - Products with total stock
- `v_low_stock_products` - Products below reorder level
- `v_product_stock_by_location` - Stock by location
- `v_receipts_list` - Receipt list with details
- `v_deliveries_list` - Delivery list with details
- `v_transfers_list` - Transfer list
- `v_adjustments_list` - Adjustment list
- `v_stock_movements` - Stock movement history
- `v_recent_activity` - Recent activity feed

## 🔑 Default Credentials

All users have password: `admin123`

- **Admin**: admin@stockmaster.com
- **Manager**: manager@stockmaster.com
- **Staff**: staff@stockmaster.com
