# Ryder's Repairs — Quote Inbox Setup

Do these once. ~20 minutes.

## 1. Supabase (database + login + photos)
1. Create a free project at supabase.com.
2. SQL Editor → paste all of `supabase-schema.sql` → Run.
3. If the admin email is ever not `rydermollica@gmail.com`, edit the three policies in that SQL to match.
4. Authentication → Providers → Google → enable. You'll need a Google Cloud OAuth client:
   - Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web).
   - Authorized redirect URI: the value Supabase shows on the Google provider screen (looks like `https://<project>.supabase.co/auth/v1/callback`).
   - Paste the Client ID + Secret back into Supabase, save.
   - (If Google setup is a pain, use "Email" provider magic links instead and tell Claude to switch login to magic-link.)
5. Project Settings → API: copy Project URL, anon key, and service_role key.

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
- Click the right star in the logo → sign in with Google → see the quote + photo in the inbox.
- Send a reply → confirm it arrives at the test customer address.
- Email `hello@rydersrepairs.com` from anywhere → confirm it lands in Ryder's Gmail.
