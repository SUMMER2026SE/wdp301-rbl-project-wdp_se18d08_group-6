# Tech stack MVP

## Decision

Dự án dùng backend Node.js/NestJS riêng. Supabase được dùng làm managed PostgreSQL database, không phải backend chính.

## Frontend

- Next.js
- TypeScript
- TailwindCSS
- App Router

## Backend

- Node.js
- NestJS
- RESTful API
- JWT Authentication
- Role-based Access Control
- Prisma ORM

## Database

- Supabase PostgreSQL
- SQL migrations trong `supabase/migrations`
- Prisma schema trong `backend/prisma/schema.prisma`

## Auth

- Backend-owned auth bằng `user_accounts`
- Password hash bằng bcrypt
- JWT do backend phát hành
- Role: `customer`, `staff`, `manager_owner`, `admin`

## AI service

- FastAPI
- PyTorch
- Cloud GPU Server, optional

MVP có thể mock AI trước bằng `tryon_requests` và `tryon_results`, sau đó mới nối FastAPI thật.

## Payment

- Mock payment trước
- VNPay hoặc MoMo sandbox sau
- Payment webhook xử lý trong backend, không xử lý ở browser

## Deployment

- Vercel cho frontend
- Railway/AWS/VPS cho backend
- Supabase cho PostgreSQL
- Cloud GPU/Railway cho AI service nếu cần

## Future enhancement

- Redis/BullMQ cho AI queue, retry payment webhook, notification queue, report cache
- Cloudinary hoặc Supabase Storage cho ảnh sản phẩm, ảnh try-on và ảnh inspection