# Team Task Breakdown

> Project: **Co Phuc Rental ERP** – Hệ thống ERP Quản trị Cho thuê Trang phục Truyền thống & Phòng thử đồ Ảo AI  
> Group: WDP_SE18D08_Group-6

---

## 👑 Thiện – LEADER / Tech Lead

**Module: Auth & System Foundation**

### Backend
- Login/register (JWT, bcrypt password hash)
- JWT access token + refresh token
- `GET /api/auth/me`
- JWT Guard + RBAC Guard (4 roles: customer, staff, manager_owner, admin)
- Module `users/` – CRUD user accounts (Admin only)
- Module `profiles/` – update profile, measurement, address
- Admin: lock/unlock account
- Audit Log middleware
- System Settings API

### Frontend
- Pages: `/login`, `/register`
- Next.js middleware route guard (JWT + role check)
- Shared dashboard layout (4 roles)
- Page: `/dashboard/admin` – user management, audit log, system settings
- Customer profile page: update info, measurements, addresses

### Tech Lead Responsibilities
- Own database schema & migrations
- Maintain `docs/api-contract.md`, `docs/database-schema-mvp.md`, README
- Review all Pull Requests before merge
- CI/CD pipeline (`.github/workflows`)
- Keep route and module naming consistent across the team
- Review booking/availability correctness with Sơn

### DB Tables
`user_accounts`, `profiles`, `customer_measurements`, `addresses`, `audit_logs`, `system_settings`

---

## 🔷 Kha – Catalog & Inventory

**Module: Catalog & Inventory Management**

### Backend
- Module `garments/` – CRUD garment templates
- Sub-module `garment-categories/` – CRUD categories
- Sub-module `garment-images/` – upload/delete images (Supabase Storage)
- Sub-module `garment-assets/` – CRUD physical assets (asset code/barcode)
- `GET /api/garments/:id/availability?start=&end=` – check availability by date range
- Asset lifecycle transition API (available → reserved → rented → inspection → laundry/maintenance → available)
- Rental Pricing management API
- Deposit Policy management API

### Frontend
- Page: `/catalog` – garment list with search/filter (type/color/size/occasion)
- Page: `/catalog/[id]` – garment detail, image gallery, size guide, price, availability checker
- Page: `/dashboard/manager/catalog` – manage garment categories and garments
- Page: `/dashboard/manager/assets` – manage physical assets (CRUD, update status)
- Image upload with preview
- Inventory report UI (asset count by status: available/rented/laundry/maintenance/retired)

### DB Tables
`garment_categories`, `garments`, `garment_images`, `garment_assets`

---

## 🔶 Sơn – Booking & Availability

**Module: Booking & Rental Order**

> ⚠️ **Highest-risk module** – review with Thiện (Tech Lead) for double-booking prevention.

### Backend
- Module `bookings/` – create rental order
- `POST /api/bookings` – create booking, calculate rental + deposit fee
- `GET /api/bookings` – list bookings (role-scoped: customer sees own, staff/manager sees all)
- `GET /api/bookings/:id` – booking detail
- `PATCH /api/bookings/:id/cancel` – cancel booking per policy
- `PATCH /api/bookings/:id/extend` – request rental extension
- Availability check: validate garment_assets not double-booked in date range
- Double-booking prevention with DB constraint/lock
- Booking Status History – record every status transition
- Auto-expire pending bookings (scheduled job)
- Mark Overdue (scheduled job or trigger)
- Rental Fee + Delivery Fee calculation logic

### Frontend
- Page: `/booking/new` – booking flow (select garment → select dates → select pickup method → confirm)
- Calendar date picker with availability check
- Page: `/booking/[id]` – booking detail with status timeline
- Page: `/dashboard/customer` – customer's booking list with status, extend/cancel buttons
- Page: `/dashboard/staff` – staff's work queue (orders to confirm/reject/prepare/deliver)
- Order status timeline component

### DB Tables
`bookings`, `booking_items`, `booking_status_history`, `delivery_records`

---

## 🟢 Hiếu – Staff Operation & Financial Management

**Module: Staff Operation + Financial Management**

### Backend – Staff Operation
- `PATCH /api/bookings/:id/confirm` – confirm order + assign asset
- `PATCH /api/bookings/:id/reject` – reject order
- `PATCH /api/bookings/:id/deliver` – deliver clothing (create delivery record)
- `PATCH /api/bookings/:id/return` – receive returned clothing (asset → InspectionPending)
- Module `inspections/` – inspection sessions
  - Create Inspection Session
  - Add Inspection Finding (type, severity, penalty amount)
  - Upload Inspection Photos
  - Confirm Damage + Apply Penalty
- Module `laundry/` – create and update laundry tickets
- Module `maintenance/` – create and update maintenance jobs

### Backend – Financial Management
- Module `payments/` – create payment (mock first), webhook handler
- `POST /api/bookings/:id/pay` – customer pays (mock or VNPay sandbox)
- Payment Webhook Handler – idempotent processing
- Module `refunds/` – create deposit refund after order completion
- Module `penalties/` – create penalty from inspection
- Financial Transaction recording
- Reports API: revenue, deposit, penalties, inventory

### Frontend
- Page: `/dashboard/staff` – work queue (confirm/reject/deliver/receive actions)
- Inspection page – capture photos, record findings, apply penalties
- Laundry and maintenance ticket management page
- Page: `/dashboard/manager/financial` – payment reconciliation, revenue/deposit/penalty view
- Revenue Report: chart by day/month
- Inventory Report
- Damage Report
- Payment integration UI for customers

### DB Tables
`inspection_sessions`, `inspection_findings`, `inspection_photos`, `laundry_tickets`, `maintenance_jobs`, `payments`, `refunds`, `penalties`, `financial_transactions`

---

## 🟣 Hải – AI Features & UI Integration

**Module: AI Virtual Try-on & AI Damage Detection + UI Polish**

### Backend
- Module `tryon/`
  - `POST /api/tryon` – create try-on request (upload customer photo + garment selection)
  - Image validation (format, size, consent check)
  - Call AI Service (mock first, FastAPI/PyTorch later)
  - Save tryon_result (result image or error)
  - `GET /api/tryon/:id` – get try-on result
  - `DELETE /api/tryon/:id/image` – delete image per retention policy
- AI Damage Detection integration:
  - Send inspection photos to AI Service
  - Receive damage findings from AI
  - Fallback when AI fails (log error, allow Staff to input manually)
- AI Usage Log – track request count, errors, cost
- Notification module (mock): order confirmation, return reminder, overdue warning

### Frontend
- Page: `/try-on`
  - Consent dialog before image upload
  - Upload personal photo
  - Select garment to try on
  - Show processing status (loading, processing, done)
  - Display result image + disclaimer
  - "Book Now" CTA button after viewing result
- AI Damage Detection UI (within Staff inspection page):
  - "Analyze with AI" button
  - Display AI-suggested findings
  - Staff confirm/reject each AI finding
- Dashboard UI Polish:
  - Responsive layout across all pages
  - Dark/light mode toggle
  - Loading states, skeleton screens, error states
  - Toast notification system
  - Notification bell/dropdown in header
- Page: `/dashboard/admin/ai` – AI service config, AI Usage Report

### DB Tables
`tryon_requests`, `tryon_results`, `notifications`

---

## 🔗 Collaboration Points

| Integration Point | Member A | Member B | Note |
|-------------------|----------|----------|------|
| Asset availability for booking | Kha | Sơn | Kha exposes API, Sơn consumes |
| Assign asset on order confirm | Sơn | Hiếu | Hiếu calls Sơn's API |
| Inspection photos → AI analysis | Hiếu | Hải | Hải builds AI module, Hiếu integrates UI |
| Garment images → Try-on | Kha | Hải | Hải needs image URLs from Kha's module |
| JWT Guard | Thiện | Everyone | Thiện builds guards, everyone applies them |
| Payment webhook → Booking status | Hiếu | Sơn | Hiếu triggers webhook, Sơn updates booking |

---

## 📅 Suggested Timeline

| Phase | Content | Weeks |
|-------|---------|-------|
| **Phase 1** | Core rental (Auth, Catalog, Booking, Payment mock) | Week 1–3 |
| **Phase 2** | ERP operation (Staff flow, Inspection, Refund, Reports) | Week 4–6 |
| **Phase 3** | AI features (Try-on, Damage Detection) + UI Polish | Week 7–9 |
| **Demo prep** | Bug fixes, deploy, demo preparation | Week 10 |

---

## Git Workflow

- Branch naming: `feat/[name]-[feature]` (e.g. `feat/son-booking-flow`)
- Create PR when feature is done, assign Thiện as reviewer
- Never push directly to `main`
- Update `docs/api-contract.md` for every new API endpoint
