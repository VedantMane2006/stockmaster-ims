const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    console.log('🧪 Testing API Endpoints...\n');
    
    try {
        // First, login to get a token
        console.log('1. Testing login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@stockmaster.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.token;
        console.log('   ✅ Login successful\n');
        
        const headers = {
            'Authorization': `Bearer ${token}`
        };
        
        // Test dashboard KPIs
        console.log('2. Testing dashboard KPIs...');
        const kpisResponse = await axios.get(`${API_URL}/dashboard/kpis`, { headers });
        console.log('   ✅ Dashboard KPIs:', kpisResponse.data);
        console.log('');
        
        // Test low stock products
        console.log('3. Testing low stock products...');
        const lowStockResponse = await axios.get(`${API_URL}/products/low-stock`, { headers });
        console.log(`   ✅ Found ${lowStockResponse.data.length} low stock products`);
        console.log('');
        
        // Test all products
        console.log('4. Testing all products...');
        const productsResponse = await axios.get(`${API_URL}/products`, { headers });
        console.log(`   ✅ Found ${productsResponse.data.length} products`);
        console.log('');
        
        // Test categories
        console.log('5. Testing categories...');
        const categoriesResponse = await axios.get(`${API_URL}/categories`, { headers });
        console.log(`   ✅ Found ${categoriesResponse.data.length} categories`);
        console.log('');
        
        // Test warehouses
        console.log('6. Testing warehouses...');
        const warehousesResponse = await axios.get(`${API_URL}/warehouses`, { headers });
        console.log(`   ✅ Found ${warehousesResponse.data.length} warehouses`);
        console.log('');
        
        // Test recent activity
        console.log('7. Testing recent activity...');
        const activityResponse = await axios.get(`${API_URL}/dashboard/recent-activity`, { headers });
        console.log(`   ✅ Found ${activityResponse.data.length} recent activities`);
        console.log('');
        
        console.log('🎉 All endpoint tests passed!\n');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testEndpoints();
