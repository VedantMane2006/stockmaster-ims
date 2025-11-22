// Dashboard JavaScript

// Check authentication
if (!checkAuth()) {
    throw new Error('Not authenticated');
}

// Load user info
const currentUser = getCurrentUser();
if (currentUser) {
    document.getElementById('userFullName').textContent = currentUser.full_name;
    document.getElementById('topUserName').textContent = currentUser.full_name;
    document.getElementById('topUserRole').textContent = currentUser.role_name;
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
});

// Load dashboard data
async function loadDashboard() {
    try {
        // Load KPIs
        const kpis = await getDashboardKPIs();
        if (kpis) {
            document.getElementById('kpiTotalProducts').textContent = formatNumber(kpis.total_products || 0);
            document.getElementById('kpiLowStock').textContent = formatNumber(kpis.low_stock_count || 0);
            document.getElementById('kpiOutOfStock').textContent = formatNumber(kpis.out_of_stock_count || 0);
            document.getElementById('kpiPendingReceipts').textContent = formatNumber(kpis.pending_receipts || 0);
            document.getElementById('kpiPendingDeliveries').textContent = formatNumber(kpis.pending_deliveries || 0);
            document.getElementById('kpiScheduledTransfers').textContent = formatNumber(kpis.scheduled_transfers || 0);
        }
        
        // Load recent activity
        await loadRecentActivity();
        
        // Load low stock products
        await loadLowStockProducts();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Failed to load dashboard data');
    }
}

async function loadRecentActivity() {
    try {
        const activity = await getRecentActivity(20);
        const tbody = document.getElementById('activityTableBody');
        
        if (!activity || activity.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No recent activity</td></tr>';
            return;
        }
        
        tbody.innerHTML = activity.map(item => `
            <tr>
                <td>${item.activity_type}</td>
                <td>${item.reference_number}</td>
                <td>${item.party_name}</td>
                <td>${getStatusBadge(item.status)}</td>
                <td>${formatDate(item.created_at)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading activity:', error);
        document.getElementById('activityTableBody').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red;">Failed to load activity</td></tr>';
    }
}

async function loadLowStockProducts() {
    try {
        const products = await getLowStockProducts();
        const tbody = document.getElementById('lowStockTableBody');
        
        if (!products || products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No low stock items</td></tr>';
            return;
        }
        
        tbody.innerHTML = products.slice(0, 10).map(product => `
            <tr>
                <td>${product.sku}</td>
                <td>${product.product_name}</td>
                <td>${product.category_name || '-'}</td>
                <td>${formatNumber(product.total_stock)}</td>
                <td>${formatNumber(product.reorder_level)}</td>
                <td style="color: var(--danger); font-weight: 600;">${formatNumber(product.stock_deficit)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading low stock:', error);
        document.getElementById('lowStockTableBody').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load low stock products</td></tr>';
    }
}

// Filter handlers
document.getElementById('filterType')?.addEventListener('change', loadRecentActivity);
document.getElementById('filterStatus')?.addEventListener('change', loadRecentActivity);

// Initial load
loadDashboard();

// Auto-refresh every 30 seconds
setInterval(loadDashboard, 30000);
