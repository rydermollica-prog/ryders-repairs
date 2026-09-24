import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isAllowedEmail } from './lib/admin.js';
import { buildReplyEmail } from './lib/emails.js';

function json(statusCode, obj) {
  return { statusCode, headers: { 'content-type': 'application/json' }, body: JSON.stringify(obj) };
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.replace(/^Bearer /, '');
  if (!token) return json(401, { ok: false, error: 'Not signed in.' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { ok: false, error: 'Session expired.' });
  if (!isAllowedEmail(userData.user.email, process.env.ALLOWED_ADMIN_EMAIL)) {
    return json(403, { ok: false, error: 'Not authorized.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return json(400, { ok: false, error: 'Bad request.' }); }
  if (!body.quoteId || !body.replyBody || String(body.replyBody).trim() === '') {
    return json(400, { ok: false, error: 'Reply text is required.' });
  }

  const { data: quote, error: qErr } = await supabase.from('quotes').select('*').eq('id', body.quoteId).single();
  if (qErr || !quote) return json(404, { ok: false, error: 'Quote not found.' });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { subject, text } = buildReplyEmail({ quote, replyBody: body.replyBody });
    const { error: sendErr } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: quote.email,
      reply_to: process.env.FROM_EMAIL,
      subject,
      text,
    });
    if (sendErr) throw sendErr;
  } catch (e) {
    console.error('reply send failed', e);
    return json(502, { ok: false, error: 'Email failed to send. Nothing was changed, please try again.' });
  }

  await supabase.from('quotes').update({
    reply_body: body.replyBody,
    replied_at: new Date().toISOString(),
    status: 'replied',
  }).eq('id', body.quoteId);

  return json(200, { ok: true });
}
