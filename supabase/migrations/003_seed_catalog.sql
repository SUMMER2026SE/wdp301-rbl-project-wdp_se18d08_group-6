-- Sample catalog data. Run after 001_initial_schema.sql.

insert into public.garment_categories (name, description) values
  ('Ao dai truyen thong', 'Trang phuc ao dai Viet Nam truyen thong'),
  ('Ao dai cach tan', 'Ao dai cach tan phu hop chup anh va su kien'),
  ('Co phuc', 'Nhat Binh, Ao Tac, Ngu Than va cac dong co phuc Viet Nam')
on conflict (name) do nothing;

with categories as (
  select id, name from public.garment_categories
), inserted_garments as (
  insert into public.garments (category_id, name, description, size_label, color, daily_price, deposit_amount)
  values
    ((select id from categories where name = 'Ao dai truyen thong'), 'Ao dai do theu sen', 'Ao dai do voi hoa tiet sen', 'M', 'Do', 350000, 1000000),
    ((select id from categories where name = 'Ao dai cach tan'), 'Ao dai trang lua mem', 'Ao dai cach tan mau trang', 'S-M', 'Trang', 320000, 900000),
    ((select id from categories where name = 'Co phuc'), 'Nhat Binh xanh ngoc', 'Bo Nhat Binh xanh ngoc kem phu kien', 'S-M', 'Xanh ngoc', 550000, 1500000),
    ((select id from categories where name = 'Co phuc'), 'Ao Tac nau tram', 'Ao Tac tong nau tram cho chup anh co trang', 'L', 'Nau', 480000, 1200000)
  on conflict do nothing
  returning id, name
)
insert into public.garment_assets (garment_id, asset_code, status)
select id, concat('ASSET-', upper(substr(md5(name), 1, 6)), '-001'), 'available'::public.asset_status from inserted_garments
union all
select id, concat('ASSET-', upper(substr(md5(name), 1, 6)), '-002'), 'available'::public.asset_status from inserted_garments
on conflict (asset_code) do nothing;