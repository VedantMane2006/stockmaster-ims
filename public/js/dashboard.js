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
        console.log('Loading dashboard KPIs...');
        const kpis = await getDashboardKPIs();
        console.log('KPIs received:', kpis);
        
        if (kpis) {
            // Parse KPI values
            const totalProducts = parseInt(kpis.total_products) || 0;
            const lowStock = parseInt(kpis.low_stock_count) || 0;
            const outOfStock = parseInt(kpis.out_of_stock_count) || 0;
            const pendingReceipts = parseInt(kpis.pending_receipts) || 0;
            const pendingDeliveries = parseInt(kpis.pending_deliveries) || 0;
            const scheduledTransfers = parseInt(kpis.scheduled_transfers) || 0;
            
            // Animate KPI values if animation function is available
            if (typeof window.animateKPIValue === 'function') {
                window.animateKPIValue(document.getElementById('kpiTotalProducts'), 0, totalProducts, 1000);
                window.animateKPIValue(document.getElementById('kpiLowStock'), 0, lowStock, 1000);
                window.animateKPIValue(document.getElementById('kpiOutOfStock'), 0, outOfStock, 1000);
                window.animateKPIValue(document.getElementById('kpiPendingReceipts'), 0, pendingReceipts, 1000);
                window.animateKPIValue(document.getElementById('kpiPendingDeliveries'), 0, pendingDeliveries, 1000);
                window.animateKPIValue(document.getElementById('kpiScheduledTransfers'), 0, scheduledTransfers, 1000);
            } else {
                // Fallback: set values directly
                document.getElementById('kpiTotalProducts').textContent = totalProducts;
                document.getElementById('kpiLowStock').textContent = lowStock;
                document.getElementById('kpiOutOfStock').textContent = outOfStock;
                document.getElementById('kpiPendingReceipts').textContent = pendingReceipts;
                document.getElementById('kpiPendingDeliveries').textContent = pendingDeliveries;
                document.getElementById('kpiScheduledTransfers').textContent = scheduledTransfers;
            }
            
            console.log('KPIs updated successfully:', {
                totalProducts, lowStock, outOfStock, 
                pendingReceipts, pendingDeliveries, scheduledTransfers
            });
        } else {
            console.error('No KPI data received');
        }
        
        // Load recent activity
        await loadRecentActivity();
        
        // Load low stock products
        await loadLowStockProducts();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data: ' + error.message, 'error');
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
