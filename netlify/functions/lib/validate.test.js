import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isHoneypotTripped, validateQuoteFields, validatePhotos } from './validate.js';

test('honeypot: tripped when company filled', () => {
  assert.equal(isHoneypotTripped({ company: 'x' }), true);
  assert.equal(isHoneypotTripped({ company: '' }), false);
  assert.equal(isHoneypotTripped({}), false);
});

test('fields: valid payload passes', () => {
  const r = validateQuoteFields({ name: 'Jane', email: 'a@b.com', garment: 'Jeans', issue: 'hem' });
  assert.equal(r.ok, true);
});

test('fields: missing name fails', () => {
  const r = validateQuoteFields({ name: '', email: 'a@b.com', garment: 'Jeans', issue: 'hem' });
  assert.equal(r.ok, false);
  assert.match(r.error, /name/i);
});

test('fields: bad email fails', () => {
  const r = validateQuoteFields({ name: 'Jane', email: 'nope', garment: 'Jeans', issue: 'hem' });
  assert.equal(r.ok, false);
  assert.match(r.error, /email/i);
});

test('photos: empty allowed', () => {
  assert.equal(validatePhotos([]).ok, true);
});

test('photos: too many rejected', () => {
  const many = Array.from({ length: 7 }, (_, i) => ({ name: `${i}.jpg`, size: 1000, type: 'image/jpeg' }));
  const r = validatePhotos(many);
  assert.equal(r.ok, false);
  assert.match(r.error, /6/);
});

test('photos: oversize rejected', () => {
  const r = validatePhotos([{ name: 'big.jpg', size: 11 * 1024 * 1024, type: 'image/jpeg' }]);
  assert.equal(r.ok, false);
  assert.match(r.error, /10 ?MB/i);
});

test('photos: non-image rejected', () => {
  const r = validatePhotos([{ name: 'x.pdf', size: 1000, type: 'application/pdf' }]);
  assert.equal(r.ok, false);
  assert.match(r.error, /image/i);
});
