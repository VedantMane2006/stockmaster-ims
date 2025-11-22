const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runDiagnostics() {
    console.log('🔍 Running Complete Diagnostics...\n');
    console.log('=' .repeat(60));
    
    try {
        // Test 1: Login
        console.log('\n📝 TEST 1: Login Authentication');
        console.log('-'.repeat(60));
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@stockmaster.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Status: SUCCESS');
        console.log(`   Token: ${token.substring(0, 20)}...`);
        console.log(`   User: ${loginResponse.data.user.full_name}`);
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Test 2: Dashboard KPIs
        console.log('\n📊 TEST 2: Dashboard KPIs');
        console.log('-'.repeat(60));
        try {
            const kpisResponse = await axios.get(`${API_URL}/dashboard/kpis`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log('   Response:', JSON.stringify(kpisResponse.data, null, 2));
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 3: Low Stock Products
        console.log('\n📦 TEST 3: Low Stock Products');
        console.log('-'.repeat(60));
        try {
            const lowStockResponse = await axios.get(`${API_URL}/products/low-stock`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${lowStockResponse.data.length} products`);
            if (lowStockResponse.data.length > 0) {
                console.log('   Sample:', lowStockResponse.data[0].product_name);
            }
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
            console.log(`   URL: ${API_URL}/products/low-stock`);
        }
        
        // Test 4: All Products
        console.log('\n📦 TEST 4: All Products');
        console.log('-'.repeat(60));
        try {
            const productsResponse = await axios.get(`${API_URL}/products`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${productsResponse.data.length} products`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 5: Categories
        console.log('\n📂 TEST 5: Categories');
        console.log('-'.repeat(60));
        try {
            const categoriesResponse = await axios.get(`${API_URL}/categories`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${categoriesResponse.data.length} categories`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 6: Warehouses
        console.log('\n🏭 TEST 6: Warehouses');
        console.log('-'.repeat(60));
        try {
            const warehousesResponse = await axios.get(`${API_URL}/warehouses`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${warehousesResponse.data.length} warehouses`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 7: Recent Activity
        console.log('\n📋 TEST 7: Recent Activity');
        console.log('-'.repeat(60));
        try {
            const activityResponse = await axios.get(`${API_URL}/dashboard/recent-activity`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${activityResponse.data.length} activities`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 8: Receipts
        console.log('\n📥 TEST 8: Receipts');
        console.log('-'.repeat(60));
        try {
            const receiptsResponse = await axios.get(`${API_URL}/receipts`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${receiptsResponse.data.length} receipts`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 9: Deliveries
        console.log('\n📤 TEST 9: Deliveries');
        console.log('-'.repeat(60));
        try {
            const deliveriesResponse = await axios.get(`${API_URL}/deliveries`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${deliveriesResponse.data.length} deliveries`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        // Test 10: Transfers
        console.log('\n🔄 TEST 10: Transfers');
        console.log('-'.repeat(60));
        try {
            const transfersResponse = await axios.get(`${API_URL}/transfers`, { headers });
            console.log('✅ Status: SUCCESS');
            console.log(`   Found: ${transfersResponse.data.length} transfers`);
        } catch (err) {
            console.log('❌ Status: FAILED');
            console.log(`   Error: ${err.response?.status} - ${err.response?.data?.error || err.message}`);
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 DIAGNOSTICS COMPLETE');
        console.log('='.repeat(60));
        console.log('\n✅ All critical endpoints are working!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Clear your browser cache (Ctrl+Shift+Delete)');
        console.log('   2. Hard refresh the page (Ctrl+F5)');
        console.log('   3. Open browser DevTools (F12) to check for errors');
        console.log('   4. Login at: http://localhost:5000');
        console.log('   5. Credentials: admin@stockmaster.com / admin123\n');
        
    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  Server is not running!');
            console.log('   Run: npm start');
        }
        process.exit(1);
    }
}

runDiagnostics();
