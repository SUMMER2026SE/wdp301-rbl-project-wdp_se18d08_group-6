# Team task breakdown

## Member 1: Auth, profile, role

- Login/register.
- Role redirect.
- Customer profile.
- Measurement.
- Address.
- Route guard and RLS review.

## Member 2: Catalog and inventory

- Garment categories.
- Garments.
- Garment images.
- Garment assets.
- Asset status.
- Manager/Owner catalog UI.

## Member 3: Booking and availability

- Booking create flow.
- Booking items.
- Rental date selection.
- Availability check.
- Prevent double-booking.
- Booking status history.

This is the highest-risk module and should be owned/reviewed by the tech lead.

## Member 4: Staff operation and financial management

- Confirm/reject order.
- Deliver clothing.
- Receive returned clothing.
- Inspection sessions.
- Findings and photos.
- Penalty.
- Refund.
- Payment mock.
- Basic reports.

## Member 5: AI and image flow

- Try-on request UI.
- Consent before image upload.
- Try-on result page.
- AI mock first.
- FastAPI/PyTorch integration later.
- AI damage detection placeholder.

## Tech lead responsibilities

- Own database schema.
- Own booking/availability correctness.
- Review RLS policies.
- Keep route/module naming consistent.
- Maintain README and setup docs.
- Review pull requests before merge.
