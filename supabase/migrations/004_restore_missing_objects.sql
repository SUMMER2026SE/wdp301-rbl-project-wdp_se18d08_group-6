-- ============================================================
-- 004_restore_missing_objects.sql
-- Bổ sung toàn bộ đối tượng còn thiếu trong DB hiện tại.
-- Chạy file này sau khi DB đã có các bảng cơ bản từ snapshot.
-- Tất cả lệnh đều an toàn để chạy lại (idempotent).
-- ============================================================

-- ------------------------------------------------------------
-- 1. ENUM TYPES còn thiếu
-- ------------------------------------------------------------
do $$ begin
  create type public.payment_status as enum (
    'pending', 'paid', 'failed', 'cancelled',
    'refunding', 'refunded', 'partially_refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.inspection_status as enum (
    'pending', 'in_progress', 'completed', 'disputed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.maintenance_status as enum (
    'open', 'in_progress', 'completed', 'cannot_repair'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.tryon_status as enum (
    'pending', 'processing', 'completed', 'failed'
  );
exception when duplicate_object then null; end $$;

-- Thêm giá trị còn thiếu vào asset_status nếu chưa có
do $$ begin
  alter type public.asset_status add value if not exists 'inspection_pending';
exception when others then null; end $$;
do $$ begin
  alter type public.asset_status add value if not exists 'laundry';
exception when others then null; end $$;
do $$ begin
  alter type public.asset_status add value if not exists 'maintenance';
exception when others then null; end $$;
do $$ begin
  alter type public.asset_status add value if not exists 'damaged';
exception when others then null; end $$;
do $$ begin
  alter type public.asset_status add value if not exists 'retired';
exception when others then null; end $$;
do $$ begin
  alter type public.asset_status add value if not exists 'lost';
exception when others then null; end $$;

-- Thêm giá trị còn thiếu vào booking_status nếu chưa có
do $$ begin
  alter type public.booking_status add value if not exists 'draft';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'awaiting_payment';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'paid';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'preparing';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'ready_for_pickup';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'delivering';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'renting';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'returned';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'inspection_pending';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'completed';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'rejected';
exception when others then null; end $$;
do $$ begin
  alter type public.booking_status add value if not exists 'overdue';
exception when others then null; end $$;

-- Thêm giá trị còn thiếu vào app_role nếu chưa có
do $$ begin
  alter type public.app_role add value if not exists 'staff';
exception when others then null; end $$;
do $$ begin
  alter type public.app_role add value if not exists 'manager_owner';
exception when others then null; end $$;
do $$ begin
  alter type public.app_role add value if not exists 'admin';
exception when others then null; end $$;

-- ------------------------------------------------------------
-- 2. CỘT còn thiếu trong các bảng đã có
-- ------------------------------------------------------------

-- user_accounts: thêm is_email_verified (snapshot có, migration chưa có)
alter table public.user_accounts
  add column if not exists is_email_verified boolean not null default false;

-- bookings: thêm delivery_address_id (migration có, snapshot thiếu)
alter table public.bookings
  add column if not exists delivery_address_id uuid
    references public.addresses(id) on delete set null;

-- bookings: thêm constraint kiểm tra ngày nếu chưa có
do $$ begin
  alter table public.bookings
    add constraint bookings_valid_date_range
    check (rental_end_date >= rental_start_date);
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------
-- 3. BẢNG còn thiếu
-- ------------------------------------------------------------

-- email_verification_codes (có trong DB thực tế, thiếu trong migration)
create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_accounts(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

-- garment_images
create table if not exists public.garment_images (
  id uuid primary key default gen_random_uuid(),
  garment_id uuid not null references public.garments(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- booking_status_history
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references public.user_accounts(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

-- delivery_records
create table if not exists public.delivery_records (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  method text not null,
  address_snapshot text,
  delivered_at timestamptz,
  received_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

-- payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider text not null default 'mock',
  provider_transaction_id text,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- penalties
create table if not exists public.penalties (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  reason text not null,
  amount numeric(12,2) not null,
  created_by uuid references public.user_accounts(id) on delete set null,
  created_at timestamptz not null default now()
);

-- refunds
create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  amount numeric(12,2) not null,
  status public.payment_status not null default 'pending',
  reason text,
  created_at timestamptz not null default now()
);

-- financial_transactions
create table if not exists public.financial_transactions (
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

-- inspection_sessions
create table if not exists public.inspection_sessions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  status public.inspection_status not null default 'pending',
  inspected_by uuid references public.user_accounts(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- inspection_findings
create table if not exists public.inspection_findings (
  id uuid primary key default gen_random_uuid(),
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  finding_type text not null,
  severity text not null default 'low',
  description text,
  penalty_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- inspection_photos
create table if not exists public.inspection_photos (
  id uuid primary key default gen_random_uuid(),
  inspection_session_id uuid not null references public.inspection_sessions(id) on delete cascade,
  image_url text not null,
  note text,
  created_at timestamptz not null default now()
);

-- laundry_tickets
create table if not exists public.laundry_tickets (
  id uuid primary key default gen_random_uuid(),
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete set null,
  status public.maintenance_status not null default 'open',
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- maintenance_jobs
create table if not exists public.maintenance_jobs (
  id uuid primary key default gen_random_uuid(),
  garment_asset_id uuid not null references public.garment_assets(id) on delete restrict,
  inspection_finding_id uuid references public.inspection_findings(id) on delete set null,
  status public.maintenance_status not null default 'open',
  note text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- tryon_requests
create table if not exists public.tryon_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.user_accounts(id) on delete cascade,
  garment_id uuid not null references public.garments(id) on delete cascade,
  status public.tryon_status not null default 'pending',
  source_image_url text,
  consent_accepted boolean not null default false,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- tryon_results
create table if not exists public.tryon_results (
  id uuid primary key default gen_random_uuid(),
  tryon_request_id uuid not null references public.tryon_requests(id) on delete cascade,
  result_image_url text,
  ai_metadata jsonb,
  created_at timestamptz not null default now()
);

-- notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.user_accounts(id) on delete cascade,
  title text not null,
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- audit_logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.user_accounts(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- system_settings
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. INDEX còn thiếu
-- ------------------------------------------------------------
create index if not exists booking_items_asset_idx
  on public.booking_items(garment_asset_id);
create index if not exists bookings_customer_idx
  on public.bookings(customer_id);
create index if not exists bookings_date_range_idx
  on public.bookings(rental_start_date, rental_end_date);
create index if not exists garment_assets_status_idx
  on public.garment_assets(status);
create index if not exists user_accounts_email_idx
  on public.user_accounts(email);

-- ------------------------------------------------------------
-- 5. FUNCTION & TRIGGER touch_updated_at
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Tạo trigger nếu chưa có
do $$ begin
  create trigger user_accounts_touch_updated_at
    before update on public.user_accounts
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger profiles_touch_updated_at
    before update on public.profiles
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger garment_assets_touch_updated_at
    before update on public.garment_assets
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger bookings_touch_updated_at
    before update on public.bookings
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;
