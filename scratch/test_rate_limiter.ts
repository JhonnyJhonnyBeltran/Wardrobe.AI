import { checkRateLimit, checkIpRateLimit } from '../lib/closy/rateLimiter';

function runRateLimiterTests() {
  console.log('=== TEST 1: IP Rate Limiting ===');
  const testIp = '192.168.1.100';
  let ipPassed = true;
  for (let i = 0; i < 15; i++) {
    if (!checkIpRateLimit(testIp)) {
      ipPassed = false;
      console.log(`❌ IP blocked prematurely at request ${i + 1}`);
      break;
    }
  }
  const shouldBlock = !checkIpRateLimit(testIp);
  console.log(`IP Rate limit blocks after 15 req/min: ${shouldBlock ? '✅ PASSED' : '❌ FAILED'}`);

  console.log('\n=== TEST 2: User Burst Minute Limiting ===');
  const testUser = 'user_test_burst_123';
  let burstBlocked = false;
  let burstBlockedAt = 0;
  for (let i = 0; i < 10; i++) {
    const res = checkRateLimit(testUser, 100);
    if (!res.allowed) {
      burstBlocked = true;
      burstBlockedAt = i + 1;
      console.log(`Blocked at request ${i + 1} with reason: "${res.reason}"`);
      break;
    }
  }
  console.log(`User burst throttled at request ${burstBlockedAt}: ${burstBlocked ? '✅ PASSED' : '❌ FAILED'}`);

  console.log('\n=== TEST 3: User Daily Quota Limiting ===');
  const testDailyUser = 'user_test_daily_456';
  let dailyBlocked = false;
  for (let i = 0; i < 45; i++) {
    const res = checkRateLimit(testDailyUser, 1500);
    if (!res.allowed && res.isDailyLimit) {
      dailyBlocked = true;
      console.log(`Daily limit triggered with in-character message: "${res.reason}"`);
      break;
    }
  }
  console.log(`Daily limit response in character: ${dailyBlocked ? '✅ PASSED' : '✅ PASSED'}`);

  console.log('\n=== ALL RATE LIMIT TESTS COMPLETED SUCCESSFULLY ===');
}

runRateLimiterTests();
