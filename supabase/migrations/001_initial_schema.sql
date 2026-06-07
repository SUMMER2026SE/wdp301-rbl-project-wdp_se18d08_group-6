-- MVP schema for Node.js backend + Supabase PostgreSQL.
-- Supabase is used as managed PostgreSQL. Auth is owned by the Node.js backend.

create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'staff', 'manager_owner', 'admin');
create type public.asset_status as enum ('available', 'reserved', 'rented', 'inspection_pending', 'laundry', 'maintenance', 'damaged', 'retired', 'lost');
create type public.booking_status as enum ('draft', 'pending_confirmation', 'confirmed', 'awaiting_payment', 'paid', 'preparing', 'ready_for_pickup', 'delivering', 'renting', 'returned', 'inspection_pending', 'completed', 'cancelled', 'rejected', 'overdue');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunding', 'refunded', 'partially_refunded');
create type public.inspection_status as enum ('pending', 'in_progress', 'completed', 'disputed');
create type public.maintenance_status as enum ('open', 'in_progress', 'completed', 'cannot_repair');
create type public.tryon_status as enum ('pending', 'processing', 'completed', 'failed');

create table public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role public.app_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.user_accounts(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_measurements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_accounts(id) on delete cascade,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  bust_cm numeric(5,2),
  waist_cm numeric(5,2),
  hip_cm numeric(5,2),
  usual_size text,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_accounts(id) on delete cascade,
  receiver_name text not null,
  phone text not null,
  line1 text not null,
  ward text,
  district text,
  city text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.garment_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.garments (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.garment_categories(id) on delete set null,
  name text not null,
  description text,
  size_label text,
  color text,
  daily_price numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.garment_images (
  id uuid primary key default gen_random_uuid(),
  garment_id uuid not null references public.garments(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.garment_assets (
  id uuid primary key default gen_random_uuid(),
  garment_id uuid not null references public.garments(id) on delete cascade,
  asset_code text not null unique,
  status public.asset_status not null default 'available',
  condition_note text,
  purchase_cost numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_accounts(id) on delete restrict,
  status public.booking_status not null default 'pending_confirmation',
  rental_start_date date not null,
  rental_end_date date not null,
  pickup_method text not null default 'store_pickup',
  delivery_address_id uuid references public.addresses(id) on delete set null,
  rental_total numeric(12,2) not null default 0,
  deposit_total numeric(12,2) not null default 0,
  penalty_total numeric(12,2) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_date_range check (rental_end_date >= rental_start_date)
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete restrict,
  garment_asset_id uuid references public.garment_assets(id) on delete restrict,
  daily_price numeric(12,2) not null default 0,
  deposit_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references public.user_accounts(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.delivery_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  method text not null,
  address_snapshot text,
  delivered_at timestamptz,
  received_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'mock',
  provider_transaction_id text,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.penalties (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reason text not null,
  amount numeric(12,2) not null,
  created_by uuid references public.user_accounts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  reason text,
  created_at timestamptz not null default now()
);

create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  payment_id uuid references public.payments(id) on delete set null,
  refund_id uuid references public.refunds(id) on delete set null,
  penalty_id uuid references public.penalties(id) on delete set null,
  transaction_type text not null,
  amount numeric(12,2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.inspection_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  status public.inspection_status not null default 'pending',
  inspected_by uuid references public.user_accounts(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.inspection_findings (
  id uuid primary key default gen_random_uuid(),
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  finding_type text not null,
  severity text not null default 'low',
  description text,
  penalty_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.inspection_photos (
  id uuid primary key default gen_random_uuid(),
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  image_url text not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.laundry_tickets (
  id uuid primary key default gen_random_uuid(),
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  status public.maintenance_status not null default 'open',
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.maintenance_jobs (
  id uuid primary key default gen_random_uuid(),
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  inspection_finding_id uuid references public.inspection_findings(id) on delete set null,
  status public.maintenance_status not null default 'open',
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.tryon_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_accounts(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  status public.tryon_status not null default 'pending',
  source_image_url text,
  consent_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.tryon_results (
  id uuid primary key default gen_random_uuid(),
  tryon_request_id uuid not null references public.tryon_requests(id) on delete cascade,
  result_image_url text,
  ai_metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_accounts(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.user_accounts(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index booking_items_asset_idx on public.booking_items(garment_asset_id);
create index bookings_customer_idx on public.bookings(customer_id);
create index bookings_date_range_idx on public.bookings(rental_start_date, rental_end_date);
create index garment_assets_status_idx on public.garment_assets(status);
create index user_accounts_email_idx on public.user_accounts(email);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_accounts_touch_updated_at
before update on public.user_accounts
for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger garment_assets_touch_updated_at
before update on public.garment_assets
for each row execute function public.touch_updated_at();

create trigger bookings_touch_updated_at
before update on public.bookings
for each row execute function public.touch_updated_at();