# Ryder's Repairs — Quote Inbox Setup

Do these once. ~20 minutes.

## 1. Supabase (database + login + photos)
1. Create a free project at supabase.com.
2. SQL Editor → paste all of `supabase-schema.sql` → Run.
3. If the admin email is ever not `rydermollica@gmail.com`, edit the three policies in that SQL to match.
4. Authentication → Providers → make sure **Email** is enabled (it is by default). No Google or OAuth setup needed — login uses a magic link.
5. Authentication → URL Configuration → **Redirect URLs**: add `https://rydersrepairs.com/inbox` and `https://rydersrepairs.com`. (This lets the emailed sign-in link land back on the site.)
   - Note: Supabase's built-in auth email is fine for one admin logging in occasionally. If sign-in emails ever get rate-limited, point Supabase's SMTP at Resend later.
6. Project Settings → API: copy **Project URL**, **anon key**, and **service_role key**.
   - Project URL and anon key are safe to share. The **service_role key is secret** — it only ever goes into Netlify, never anywhere public.

## 2. Resend (sending email)
1. Create a free account at resend.com.
2. Add domain `rydersrepairs.com`. Resend shows a few DNS records (SPF/DKIM, on a `send.` subdomain).
3. In Cloudflare DNS, add those records EXACTLY, set them to DNS-only (grey cloud). Wait for Resend to show "Verified".
4. API Keys → create one → copy it.

## 3. Cloudflare Email Routing (receiving hello@)
1. Cloudflare dashboard → your domain → Email → Email Routing → enable (it adds MX + TXT automatically).
2. Add a route: `hello@rydersrepairs.com` → forward to `rydermollica@gmail.com`. Confirm the forwarding address via the verification email Cloudflare sends.

## 4. Netlify (env vars)
Site settings → Environment variables → add:
- `SUPABASE_URL` = project URL
- `SUPABASE_ANON_KEY` = anon key
- `SUPABASE_SERVICE_KEY` = service_role key
- `RESEND_API_KEY` = the Resend key
- `ALLOWED_ADMIN_EMAIL` = `rydermollica@gmail.com`
- `FROM_EMAIL` = `hello@rydersrepairs.com`
- `SITE_URL` = `https://rydersrepairs.com`
Then trigger a deploy.

## 5. Verify
- Submit a test quote on the live site with a photo.
- Check `rydermollica@gmail.com` for the "New quote" email.
- Click the right star in the logo → enter Ryder's email → click the sign-in link that arrives → see the quote + photo in the inbox.
- Send a reply → confirm it arrives at the test customer address.
- Email `hello@rydersrepairs.com` from anywhere → confirm it lands in Ryder's Gmail.
