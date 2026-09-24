import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildNotificationEmail, buildReplyEmail } from './emails.js';

const quote = { name: 'Jane Smith', email: 'jane@x.com', garment: 'Jeans', issue: 'Knee blowout' };

test('notification email has subject + details + inbox link', () => {
  const { subject, text } = buildNotificationEmail({ quote, inboxUrl: 'https://rydersrepairs.com/inbox' });
  assert.match(subject, /new quote/i);
  assert.match(text, /Jane Smith/);
  assert.match(text, /Jeans/);
  assert.match(text, /Knee blowout/);
  assert.match(text, /rydersrepairs\.com\/inbox/);
  assert.ok(!text.includes('—'), 'no em dashes');
});

test('reply email includes the reply body and no em dash', () => {
  const { subject, text } = buildReplyEmail({ quote, replyBody: 'Happy to do that. $40.' });
  assert.match(subject, /quote/i);
  assert.match(text, /Happy to do that\. \$40\./);
  assert.ok(!text.includes('—'), 'no em dashes');
});
