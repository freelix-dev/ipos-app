async function testAuthAndUsers() {
  const API_URL = 'http://127.0.0.1:3000/api';
  console.log('--- Starting API Tests (Using Fetch) ---');
  
  try {
    // 1. Test Login
    console.log('\n[1] Testing Login...');
    const loginRes = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ipos.com', password: '123' })
    });
    const loginData: any = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    console.log('✅ Login Successful:', loginData.user.name);

    // 2. Test Get Users
    console.log('\n[2] Fetching User List...');
    const usersRes = await fetch(`${API_URL}/users`);
    const usersData: any = await usersRes.json();
    console.log('✅ Found', usersData.length, 'users');

    // 3. Test Create User
    console.log('\n[3] Creating a test user...');
    const newUser = {
      name: 'Test Staff',
      email: `staff_${Date.now()}@ipos.com`,
      password: 'password123',
      role: 'user'
    };
    const createRes = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const createData: any = await createRes.json();
    if (!createRes.ok) throw new Error(createData.message);
    console.log('✅ User Created Successfully:', createData.id);

    console.log('\n--- ALL TESTS PASSED SUCCESSFULLY ---');
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.message);
  }
}

testAuthAndUsers();
