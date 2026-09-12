// API Helper Functions

const API_URL = 'http://localhost:5000/api';

// Get auth token
function getToken() {
    return localStorage.getItem('token');
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Generic API call
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = getToken();
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            logout();
            return null;
        }
        
        // Try to parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (e) {
            // If JSON parsing fails, use text
            const text = await response.text();
            throw new Error(`API Error ${response.status}: ${text || response.statusText}`);
        }
        
        // Handle non-OK responses with better error messages
        if (!response.ok) {
            const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Dashboard APIs
async function getDashboardKPIs() {
    return await apiCall('/dashboard/kpis');
}

async function getRecentActivity(limit = 20) {
    return await apiCall(`/dashboard/recent-activity?limit=${limit}`);
}

async function getStockMovements(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/dashboard/stock-movements?${params}`);
}

// Product APIs
async function getProducts(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/products?${params}`);
}

async function getProduct(id) {
    return await apiCall(`/products/${id}`);
}

async function createProduct(data) {
    return await apiCall('/products', 'POST', data);
}

async function updateProduct(id, data) {
    return await apiCall(`/products/${id}`, 'PUT', data);
}

async function getLowStockProducts() {
    return await apiCall('/products/low-stock');
}

async function getCategories() {
    return await apiCall('/categories');
}

async function createCategory(data) {
    return await apiCall('/categories', 'POST', data);
}

// Receipt APIs
async function getReceipts(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/receipts?${params}`);
}

async function getReceipt(id) {
    return await apiCall(`/receipts/${id}`);
}

async function createReceipt(data) {
    return await apiCall('/receipts', 'POST', data);
}

async function addReceiptLine(receiptId, data) {
    return await apiCall(`/receipts/${receiptId}/lines`, 'POST', data);
}

async function updateReceiptStatus(receiptId, status) {
    return await apiCall(`/receipts/${receiptId}/status`, 'PUT', { status });
}

async function updateReceivedQuantity(receiptId, lineId, quantity) {
    return await apiCall(`/receipts/${receiptId}/lines/${lineId}/receive`, 'PUT', { quantity_received: quantity });
}

async function validateReceipt(receiptId) {
    return await apiCall(`/receipts/${receiptId}/validate`, 'POST');
}

// Delivery APIs
async function getDeliveries(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/deliveries?${params}`);
}

async function getDelivery(id) {
    return await apiCall(`/deliveries/${id}`);
}

async function createDelivery(data) {
    return await apiCall('/deliveries', 'POST', data);
}

async function addDeliveryLine(deliveryId, data) {
    return await apiCall(`/deliveries/${deliveryId}/lines`, 'POST', data);
}

async function updateDeliveryStatus(deliveryId, status) {
    return await apiCall(`/deliveries/${deliveryId}/status`, 'PUT', { status });
}

async function updateDeliveredQuantity(deliveryId, lineId, quantity) {
    return await apiCall(`/deliveries/${deliveryId}/lines/${lineId}/deliver`, 'PUT', { quantity_delivered: quantity });
}

async function validateDelivery(deliveryId) {
    return await apiCall(`/deliveries/${deliveryId}/validate`, 'POST');
}

// Transfer APIs
async function getTransfers(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/transfers?${params}`);
}

async function getTransfer(id) {
    return await apiCall(`/transfers/${id}`);
}

async function createTransfer(data) {
    return await apiCall('/transfers', 'POST', data);
}

// Adjustment APIs
async function getAdjustments(filters = {}) {
    const params = new URLSearchParams(filters);
    return await apiCall(`/adjustments?${params}`);
}

async function getAdjustment(id) {
    return await apiCall(`/adjustments/${id}`);
}

async function createAdjustment(data) {
    return await apiCall('/adjustments', 'POST', data);
}

// Warehouse APIs
async function getWarehouses() {
    return await apiCall('/warehouses');
}

async function getWarehouseLocations(warehouseId) {
    return await apiCall(`/warehouses/${warehouseId}/locations`);
}

async function createWarehouse(data) {
    return await apiCall('/warehouses', 'POST', data);
}

async function createLocation(data) {
    return await apiCall('/locations', 'POST', data);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function getStatusBadge(status) {
    const statusMap = {
        'DRAFT': 'badge-draft',
        'WAITING': 'badge-waiting',
        'READY': 'badge-ready',
        'DONE': 'badge-done',
        'CANCELLED': 'badge-cancelled'
    };
    return `<span class="badge ${statusMap[status] || 'badge-draft'}">${status}</span>`;
}
