import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isHoneypotTripped, validateQuoteFields, validatePhotos } from './lib/validate.js';
import { buildNotificationEmail } from './lib/emails.js';

function json(statusCode, obj) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) };
}
function sanitize(name) {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return json(400, { ok: false, error: 'Bad request.' }); }

  if (isHoneypotTripped(body)) return json(200, { ok: true }); // silently drop bots

  const fields = validateQuoteFields(body);
  if (!fields.ok) return json(400, { ok: false, error: fields.error });
  const photos = Array.isArray(body.photos) ? body.photos : [];
  const photoCheck = validatePhotos(photos);
  if (!photoCheck.ok) return json(400, { ok: false, error: photoCheck.error });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const id = crypto.randomUUID();
  const paths = photos.map((p) => `${id}/${sanitize(p.name)}`);

  const { error: insertErr } = await supabase.from('quotes').insert({
    id,
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone ? String(body.phone).trim() : null,
    garment: body.garment,
    issue: body.issue.trim(),
    photos: paths,
  });
  if (insertErr) return json(500, { ok: false, error: 'Could not save your request. Please try again.' });

  const uploads = [];
  for (const path of paths) {
    const { data, error } = await supabase.storage.from('quote-photos').createSignedUploadUrl(path);
    if (error) return json(500, { ok: false, error: 'Could not prepare photo upload.' });
    uploads.push({ path, signedUrl: data.signedUrl, token: data.token });
  }

  // Notify Ryder (do not fail the whole request if the email hiccups)
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const inboxUrl = `${process.env.SITE_URL || 'https://rydersrepairs.com'}/inbox`;
    const { subject, text } = buildNotificationEmail({ quote: body, inboxUrl });
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ALLOWED_ADMIN_EMAIL,
      reply_to: body.email,
      subject,
      text,
    });
  } catch (e) {
    console.error('notification email failed', e);
  }

  return json(200, { ok: true, quoteId: id, uploads });
}
