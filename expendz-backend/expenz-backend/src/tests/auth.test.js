// tests/auth.test.js
/**
 * Automated test script for Auth endpoints
 * Run: node tests/auth.test.js
 * Make sure server is running first: npm run dev
 */

const axios = require('axios');

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  validateStatus: () => true, // Don't throw on non-2xx
});

// Colors for console output
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;
let token = null;

const log = {
  title: (msg) => console.log(`\n${c.bold}${c.cyan}━━━ ${msg} ━━━${c.reset}`),
  pass: (msg) => { console.log(`${c.green}✓${c.reset} ${msg}`); passed++; },
  fail: (msg, err) => {
    console.log(`${c.red}✗ ${msg}${c.reset}`);
    if (err) console.log(`  ${c.yellow}└─ ${err}${c.reset}`);
    failed++;
  },
  info: (msg) => console.log(`${c.cyan}ℹ${c.reset} ${msg}`),
};

const assert = (condition, msg, errMsg) => {
  if (condition) log.pass(msg);
  else log.fail(msg, errMsg);
};

// Generate unique test email each run
const testEmail = `test_${Date.now()}@expenz.test`;
const testUser = {
  name: 'Test User',
  email: testEmail,
  password: 'Test1234!',
};

const runTests = async () => {
  console.log(`\n${c.bold}🧪 EXPENZ Auth API Test Suite${c.reset}`);
  console.log(`${c.cyan}Test email: ${testEmail}${c.reset}`);

  // ───── HEALTH CHECK ─────
  log.title('Health Check');
  try {
    const res = await API.get('/health');
    assert(res.status === 200, 'GET /health returns 200');
    assert(res.data.success === true, 'Health response success=true');
  } catch (err) {
    log.fail('Server not reachable. Is it running on port 5000?', err.message);
    return;
  }

  // ───── REGISTER ─────
  log.title('Register Endpoint');

  // Test 1: Missing fields
  {
    const res = await API.post('/auth/register', {});
    assert(res.status === 400, 'POST /register with empty body returns 400');
    assert(res.data.errors?.name, 'Returns name error');
    assert(res.data.errors?.email, 'Returns email error');
    assert(res.data.errors?.password, 'Returns password error');
  }

  // Test 2: Invalid email
  {
    const res = await API.post('/auth/register', {
      name: 'Test',
      email: 'not-an-email',
      password: '123456',
    });
    assert(res.status === 400, 'Invalid email returns 400');
    assert(res.data.errors?.email, 'Returns email validation error');
  }

  // Test 3: Short password
  {
    const res = await API.post('/auth/register', {
      name: 'Test',
      email: 'valid@email.com',
      password: '12',
    });
    assert(res.status === 400, 'Short password returns 400');
    assert(res.data.errors?.password, 'Returns password length error');
  }

  // Test 4: Successful registration
  {
    const res = await API.post('/auth/register', testUser);
    assert(res.status === 201, 'Valid registration returns 201');
    assert(res.data.success === true, 'Response success=true');
    assert(res.data.data?.token, 'Returns JWT token');
    assert(res.data.data?.user?.email === testUser.email.toLowerCase(), 'Returns user with correct email');
    assert(!res.data.data?.user?.password, 'Password NOT included in response');
    assert(res.data.data?.user?._id, 'Returns user ID');
    token = res.data.data?.token;
  }

  // Test 5: Duplicate email
  {
    const res = await API.post('/auth/register', testUser);
    assert(res.status === 409, 'Duplicate email returns 409');
    assert(res.data.message.toLowerCase().includes('already'), 'Error message mentions duplicate');
  }

  // ───── LOGIN ─────
  log.title('Login Endpoint');

  // Test 6: Missing credentials
  {
    const res = await API.post('/auth/login', {});
    assert(res.status === 400, 'Empty login returns 400');
  }

  // Test 7: Wrong password
  {
    const res = await API.post('/auth/login', {
      email: testUser.email,
      password: 'WrongPassword123',
    });
    assert(res.status === 401, 'Wrong password returns 401');
  }

  // Test 8: Non-existent user
  {
    const res = await API.post('/auth/login', {
      email: 'doesnotexist@expenz.com',
      password: 'somepass',
    });
    assert(res.status === 401, 'Non-existent user returns 401');
  }

  // Test 9: Successful login
  {
    const res = await API.post('/auth/login', {
      email: testUser.email,
      password: testUser.password,
    });
    assert(res.status === 200, 'Valid login returns 200');
    assert(res.data.data?.token, 'Returns JWT token');
    assert(res.data.data?.user?.email === testUser.email.toLowerCase(), 'Returns correct user');
    assert(!res.data.data?.user?.password, 'Password NOT in response');
    token = res.data.data?.token;
  }

  // Test 10: Case-insensitive email login
  {
    const res = await API.post('/auth/login', {
      email: testUser.email.toUpperCase(),
      password: testUser.password,
    });
    assert(res.status === 200, 'Uppercase email login works (case-insensitive)');
  }

  // ───── PROTECTED ROUTES ─────
  log.title('Protected Routes - GET /me');

  // Test 11: No token
  {
    const res = await API.get('/auth/me');
    assert(res.status === 401, 'No token returns 401');
  }

  // Test 12: Invalid token
  {
    const res = await API.get('/auth/me', {
      headers: { Authorization: 'Bearer invalid.jwt.token' },
    });
    assert(res.status === 401, 'Invalid token returns 401');
  }

  // Test 13: Valid token
  {
    const res = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res.status === 200, 'Valid token returns 200');
    assert(res.data.data?.user?.email === testUser.email.toLowerCase(), '/me returns correct user');
  }

  // ───── LOGOUT ─────
  log.title('Logout Endpoint');
  {
    const res = await API.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res.status === 200, 'Logout returns 200');
  }

  // ───── 404 ─────
  log.title('404 Handler');
  {
    const res = await API.get('/nonexistent');
    assert(res.status === 404, 'Unknown route returns 404');
  }

  // ───── SUMMARY ─────
  console.log(`\n${c.bold}━━━━━━━━━━ TEST SUMMARY ━━━━━━━━━━${c.reset}`);
  console.log(`${c.green}✓ Passed: ${passed}${c.reset}`);
  console.log(`${c.red}✗ Failed: ${failed}${c.reset}`);
  console.log(`Total:    ${passed + failed}`);

  if (failed === 0) {
    console.log(`\n${c.green}${c.bold}🎉 All tests passed! Backend is ready.${c.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${c.red}${c.bold}⚠  ${failed} test(s) failed. Check above.${c.reset}\n`);
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error(`${c.red}❌ Test runner crashed:${c.reset}`, err.message);
  process.exit(1);
});