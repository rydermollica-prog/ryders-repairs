-- Quotes table
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  garment text not null,
  issue text not null,
  photos jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  reply_body text,
  replied_at timestamptz
);

alter table public.quotes enable row level security;

-- Only the allowed admin (matched by JWT email) can read/update. No public access.
-- Replace the email in these policies OR keep in sync with ALLOWED_ADMIN_EMAIL.
create policy "admin can read quotes"
  on public.quotes for select
  using ( auth.jwt() ->> 'email' = 'rydermollica@gmail.com' );

create policy "admin can update quotes"
  on public.quotes for update
  using ( auth.jwt() ->> 'email' = 'rydermollica@gmail.com' );

-- Inserts happen only via the service-key function, which bypasses RLS. No insert policy = no public insert.

-- Private storage bucket for photos
insert into storage.buckets (id, name, public)
values ('quote-photos', 'quote-photos', false)
on conflict (id) do nothing;

-- Allow the admin to read photo objects (for signed URLs in the inbox)
create policy "admin can read quote photos"
  on storage.objects for select
  using (
    bucket_id = 'quote-photos'
    and auth.jwt() ->> 'email' = 'rydermollica@gmail.com'
  );
