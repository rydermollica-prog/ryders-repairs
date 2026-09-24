import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedEmail } from './admin.js';

test('allowlist is case-insensitive and trims', () => {
  assert.equal(isAllowedEmail(' Ryder@Gmail.com ', 'ryder@gmail.com'), true);
  assert.equal(isAllowedEmail('someone@else.com', 'ryder@gmail.com'), false);
  assert.equal(isAllowedEmail('', 'ryder@gmail.com'), false);
  assert.equal(isAllowedEmail('ryder@gmail.com', ''), false);
});
