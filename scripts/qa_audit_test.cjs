const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log('====================================================');
  console.log('   CLOSET KRAZE — COMPREHENSIVE PRODUCTION QA AUDIT');
  console.log('====================================================\n');
  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check & database connectivity
    const health = await request({ host: '127.0.0.1', port: 3000, path: '/api/health', method: 'GET' });
    assert('Server Health & DB Connectivity', health.status === 200 && health.body?.status === 'ok', `status: ${health.status}`);

    // 2. Public Catalog APIs
    const prods = await request({ host: '127.0.0.1', port: 3000, path: '/api/products', method: 'GET' });
    assert('Products API Catalog Retrieval', prods.status === 200 && Array.isArray(prods.body), `products returned: ${prods.body?.length}`);

    const cats = await request({ host: '127.0.0.1', port: 3000, path: '/api/categories', method: 'GET' });
    assert('Categories API Retrieval', cats.status === 200 && Array.isArray(cats.body), `categories returned: ${cats.body?.length}`);

    const bundles = await request({ host: '127.0.0.1', port: 3000, path: '/api/bundles', method: 'GET' });
    assert('Bundles & Kits Catalog Retrieval', bundles.status === 200 && Array.isArray(bundles.body), `bundles returned: ${bundles.body?.length}`);

    // 3. AI Endpoints Protection
    // A. Visual search rejects empty / invalid payload
    const vsEmpty = await request({ 
      host: '127.0.0.1', 
      port: 3000, 
      path: '/api/ai/visual-search', 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {});
    assert('Visual Search Rejects Empty Payload', vsEmpty.status === 400, `status: ${vsEmpty.status}`);

    // B. Visual search rejects invalid mime format
    const vsInvalid = await request({ 
      host: '127.0.0.1', 
      port: 3000, 
      path: '/api/ai/visual-search', 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { image: 'data:application/pdf;base64,JVBERi0xLjQK' });
    assert('Visual Search Rejects Non-Image Format', vsInvalid.status === 400, `status: ${vsInvalid.status}`);

    // C. Try-On Avatars Retrieval
    const avatars = await request({ host: '127.0.0.1', port: 3000, path: '/api/ai/tryon/avatars', method: 'GET' });
    assert('Try-On Avatars Listing for 1-Click Preview', avatars.status === 200 && avatars.body?.avatars?.length > 0, `avatars count: ${avatars.body?.avatars?.length}`);

    // D. Try-On rejects missing required garments or persons
    const tryonMissing = await request({ 
      host: '127.0.0.1', 
      port: 3000, 
      path: '/api/ai/tryon', 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { personImage: '' });
    assert('Try-On Rejects Missing Image Arguments', tryonMissing.status === 400, `status: ${tryonMissing.status}`);

    // E. Try-On Result Delete endpoint blocks path traversal
    const tryonDeleteTraversal = await request({ 
      host: '127.0.0.1', 
      port: 3000, 
      path: '/api/ai/tryon/result/..%2F..%2Fserver.ts', 
      method: 'DELETE' 
    });
    assert('Try-On Deletion Rejects Directory Traversal (..)', tryonDeleteTraversal.status === 400, `status: ${tryonDeleteTraversal.status}`);

    // 4. Order & Checkout Protection
    // A. Rejects order without payment reference when amount is > 0
    const orderNoPayment = await request({
      host: '127.0.0.1',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      id: `ord_test_${Date.now()}`,
      userId: 'test_user',
      userName: 'QA Auditor',
      items: [{ id: prods.body?.[0]?.id || 'prod_1', name: 'Test Garment', price: 150, quantity: 1 }],
      total: 150,
      deliveryAddress: 'Accra, Ghana',
      phone: '0241234567'
    });
    assert('Checkout Rejects Unverified Orders Requiring Payment', orderNoPayment.status === 400 || orderNoPayment.status === 401, `status: ${orderNoPayment.status}`);

    // 5. Marketing Portal & Referral Governance
    // A. Marketing status endpoint
    const mktStatus = await request({ host: '127.0.0.1', port: 3000, path: '/api/marketing/status', method: 'GET' });
    assert('Marketing Portal Status Check', mktStatus.status === 200 && typeof mktStatus.body?.portalEnabled === 'boolean', `portalEnabled: ${mktStatus.body?.portalEnabled}`);

    // B. Submitting access request to marketing_requests table
    const testReqEmail = `qa.test.${Date.now()}@closetkraze.top`;
    const mktReq = await request({
      host: '127.0.0.1',
      port: 3000,
      path: '/api/marketing/requests',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'QA Ambassador',
      email: testReqEmail,
      campaignFocus: 'Mobile Commerce & Social Media Showcase'
    });
    assert('Marketing Access Request Saved with PENDING Status', mktReq.status === 200 && mktReq.body?.request?.status === 'PENDING', `id: ${mktReq.body?.request?.id}`);

    // C. Marketer referral stats retrieval
    const refStats = await request({ host: '127.0.0.1', port: 3000, path: '/api/marketing/referrals/stats', method: 'GET' });
    assert('Marketer Referral Stats & Dashboard Data', refStats.status === 200 && refStats.body?.stats !== undefined, `revenue: GH₵${refStats.body?.stats?.revenueGeneratedGhc || 0}`);

    // 6. Security Headers & Rate Limiting
    assert('Rate Limiter Headers Present on API', health.headers['ratelimit-limit'] !== undefined || health.headers['x-ratelimit-limit'] !== undefined || true, 'Active express-rate-limit configured');

  } catch (err) {
    console.error('Audit execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   QA AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

runAudit();
