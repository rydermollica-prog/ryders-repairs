const MAX_PHOTOS = 6;
const MAX_BYTES = 10 * 1024 * 1024;

export function isHoneypotTripped(body) {
  return Boolean(body && typeof body.company === 'string' && body.company.trim().length > 0);
}

export function validateQuoteFields(body = {}) {
  const req = ['name', 'garment', 'issue'];
  for (const f of req) {
    if (!body[f] || String(body[f]).trim() === '') {
      return { ok: false, error: `Please fill in your ${f}.` };
    }
  }
  const email = String(body.email || '').trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    return { ok: false, error: 'Please enter a valid email.' };
  }
  return { ok: true };
}

export function validatePhotos(photos = []) {
  if (!Array.isArray(photos)) return { ok: false, error: 'Photos must be a list.' };
  if (photos.length > MAX_PHOTOS) return { ok: false, error: `Please attach at most ${MAX_PHOTOS} photos.` };
  for (const p of photos) {
    if (typeof p.size === 'number' && p.size > MAX_BYTES) {
      return { ok: false, error: 'Each photo must be under 10 MB.' };
    }
    if (typeof p.type === 'string' && !p.type.startsWith('image/')) {
      return { ok: false, error: 'Photos must be image files.' };
    }
  }
  return { ok: true };
}
