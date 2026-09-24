import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNotificationEmail, buildReplyEmail } from './emails.js';

const quote = { name: 'Jane Smith', email: 'jane@x.com', garment: 'Jeans', issue: 'Knee blowout' };

test('notification email has subject + details + inbox link', () => {
  const { subject, text } = buildNotificationEmail({
    quote, inboxUrl: 'https://rydersrepairs.com/inbox', from: 'hello@rydersrepairs.com', to: 'ryder@gmail.com',
  });
  assert.match(subject, /new quote/i);
  assert.match(text, /Jane Smith/);
  assert.match(text, /Jeans/);
  assert.match(text, /Knee blowout/);
  assert.match(text, /rydersrepairs\.com\/inbox/);
  assert.ok(!text.includes('—'), 'no em dashes');
});

test('notification email is a Resend payload with camelCase replyTo (not reply_to)', () => {
  const p = buildNotificationEmail({
    quote, inboxUrl: 'https://x/inbox', from: 'hello@rydersrepairs.com', to: 'ryder@gmail.com',
  });
  assert.equal(p.from, 'hello@rydersrepairs.com');
  assert.equal(p.to, 'ryder@gmail.com');
  assert.equal(p.replyTo, 'jane@x.com'); // so Ryder can reply straight to the customer
  assert.ok(!('reply_to' in p), 'must use replyTo, the key the Resend SDK reads');
});

test('reply email includes the reply body and no em dash', () => {
  const { subject, text } = buildReplyEmail({ quote, replyBody: 'Happy to do that. $40.', from: 'hello@rydersrepairs.com' });
  assert.match(subject, /quote/i);
  assert.match(text, /Happy to do that\. \$40\./);
  assert.ok(!text.includes('—'), 'no em dashes');
});

test('reply email is a Resend payload to the customer with camelCase replyTo', () => {
  const p = buildReplyEmail({ quote, replyBody: 'ok', from: 'hello@rydersrepairs.com' });
  assert.equal(p.to, 'jane@x.com');
  assert.equal(p.from, 'hello@rydersrepairs.com');
  assert.equal(p.replyTo, 'hello@rydersrepairs.com');
  assert.ok(!('reply_to' in p), 'must use replyTo, the key the Resend SDK reads');
});
