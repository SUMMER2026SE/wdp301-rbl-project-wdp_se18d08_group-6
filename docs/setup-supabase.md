# Supabase setup

## Role of Supabase

Supabase được dùng làm managed PostgreSQL database. Backend Node.js/NestJS sẽ kết nối tới database bằng Prisma qua `DATABASE_URL`.

Trong MVP này, frontend không gọi Supabase trực tiếp và không dùng Supabase Auth.

## 1. Create Supabase project

Tạo project mới trên Supabase rồi lấy PostgreSQL connection string.

Dạng URL:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

Điền URL này vào:

```text
backend/.env
```

## 2. Apply SQL files

Chạy theo thứ tự trong Supabase SQL Editor:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_backend_security_notes.sql`
3. `supabase/migrations/003_seed_catalog.sql`

## 3. Generate Prisma client

Sau khi tạo `backend/.env`, chạy:

```bash
cd backend
npm run prisma:generate
```

## 4. Auth model

Auth được lưu trong bảng:

```text
user_accounts
profiles
```

Backend register/login sẽ:

- Hash password bằng bcrypt.
- Lưu user vào `user_accounts`.
- Lưu thông tin cá nhân vào `profiles`.
- Trả JWT cho frontend.

## 5. Security warning

Không đưa `DATABASE_URL` vào frontend. Chỉ backend được dùng connection string database.

Trước production thật cần bổ sung:

- JWT guard.
- Role guard.
- Rate limit login.
- Refresh token hoặc session strategy.
- Audit log cho thao tác nhạy cảm.
- Database user privilege review.