# API Contract

Base URL:

```text
http://localhost:4000/api
```

Frontend must call the NestJS backend API. Do not call Supabase directly from the frontend for business operations.

## Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "message": "optional message"
}
```

Error:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```

## Existing Endpoints

### Health

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "co-phuc-rental-erp-backend"
  }
}
```

### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "customer@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "customer@example.com",
    "fullName": "Nguyen Van A",
    "role": "customer"
  }
}
```

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

### Get Current User

```http
GET /api/auth/me
```

Headers:

```http
Authorization: Bearer jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "customer@example.com",
    "role": "customer",
    "isActive": true,
    "fullName": "Nguyen Van A",
    "phone": null
  }
}
```

### Update Profile

```http
PATCH /api/users/me/profile
```

Headers:

```http
Authorization: Bearer jwt-token
```

Request:

```json
{
  "fullName": "Nguyen Van A",
  "phone": "0909000000"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "customer@example.com",
    "role": "customer",
    "isActive": true,
    "fullName": "Nguyen Van A",
    "phone": "0909000000"
  }
}
```

### Get Latest Measurements

Customer-only endpoint.

```http
GET /api/users/me/measurements
```

Headers:

```http
Authorization: Bearer jwt-token
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "heightCm": 165.5,
    "weightKg": 50,
    "bustCm": null,
    "waistCm": null,
    "hipCm": null,
    "usualSize": "M",
    "createdAt": "2026-06-12T00:00:00.000Z"
  }
}
```

If the customer has not saved measurements yet:

```json
{
  "success": true,
  "data": null
}
```

### Update Measurements

Customer-only endpoint.

```http
PATCH /api/users/me/measurements
```

Headers:

```http
Authorization: Bearer jwt-token
```

Request:

```json
{
  "heightCm": 165.5,
  "weightKg": 50,
  "usualSize": "M"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "heightCm": 165.5,
    "weightKg": 50,
    "bustCm": null,
    "waistCm": null,
    "hipCm": null,
    "usualSize": "M",
    "createdAt": "2026-06-12T00:00:00.000Z"
  }
}
```

### Create Address

Customer-only endpoint.

```http
POST /api/users/me/addresses
```

Headers:

```http
Authorization: Bearer jwt-token
```

Request:

```json
{
  "receiverName": "Nguyen Van A",
  "phone": "0909000000",
  "line1": "123 Le Loi",
  "district": "District 1",
  "city": "Ho Chi Minh City",
  "isDefault": true
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "receiverName": "Nguyen Van A",
    "phone": "0909000000",
    "line1": "123 Le Loi",
    "ward": null,
    "district": "District 1",
    "city": "Ho Chi Minh City",
    "isDefault": true,
    "createdAt": "2026-06-12T00:00:00.000Z"
  }
}
```

### List Addresses

Customer-only endpoint.

```http
GET /api/users/me/addresses
```

Headers:

```http
Authorization: Bearer jwt-token
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "receiverName": "Nguyen Van A",
      "phone": "0909000000",
      "line1": "123 Le Loi",
      "ward": null,
      "district": "District 1",
      "city": "Ho Chi Minh City",
      "isDefault": true,
      "createdAt": "2026-06-12T00:00:00.000Z"
    }
  ]
}
```

### List Garments

```http
GET /api/garments
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ao dai do theu sen",
      "categoryName": "Ao dai truyen thong",
      "sizeLabel": "M",
      "dailyPrice": 350000,
      "depositAmount": 1000000
    }
  ]
}
```

## Planned Endpoints

### Catalog and Assets

```http
POST /api/garments
PATCH /api/garments/:id
GET /api/garments/:id
POST /api/garments/:id/images
GET /api/assets
POST /api/assets
PATCH /api/assets/:id/status
```

Manager/Owner owns create/update catalog and asset operations.

### Booking

```http
POST /api/bookings/check-availability
POST /api/bookings
GET /api/bookings/me
GET /api/bookings/:id
PATCH /api/bookings/:id/cancel
PATCH /api/bookings/:id/confirm
PATCH /api/bookings/:id/reject
PATCH /api/bookings/:id/mark-delivered
PATCH /api/bookings/:id/mark-returned
```

Booking creation must run on the backend and must prevent double-booking of the same `GarmentAsset` over overlapping dates.

### Payment and Financial Management

```http
POST /api/payments/mock
GET /api/payments/booking/:bookingId
POST /api/refunds
POST /api/penalties
GET /api/reports/revenue
GET /api/reports/deposits
```

Do not let frontend directly set payment status as paid for real payment flows.

### Inspection and Staff Operation

```http
POST /api/inspections
GET /api/inspections/booking/:bookingId
POST /api/inspections/:id/findings
POST /api/inspections/:id/photos
POST /api/laundry-tickets
PATCH /api/laundry-tickets/:id/status
POST /api/maintenance-jobs
PATCH /api/maintenance-jobs/:id/status
```

### AI

```http
POST /api/ai/tryon-requests
GET /api/ai/tryon-requests/:id
POST /api/ai/damage-detection-requests
GET /api/ai/damage-detection-requests/:id
```

AI request flow must store consent and support failed/pending/completed states.

## API Change Rules

Before changing this contract:

1. Check if frontend or backend already depends on the endpoint.
2. Update this file.
3. Update DTOs and frontend types.
4. Add or update tests.
5. Mention the API change in the PR summary.
