export function isAllowedEmail(email, allowed) {
  const a = String(email || '').trim().toLowerCase();
  const b = String(allowed || '').trim().toLowerCase();
  return a.length > 0 && b.length > 0 && a === b;
}
