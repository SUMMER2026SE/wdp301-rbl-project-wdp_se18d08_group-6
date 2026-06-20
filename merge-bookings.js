const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/bookings/bookings.service.ts', 'utf8');

// 1. Move `booking.created` from `findOne` to `create`
content = content.replace(
  /<<<<<<< HEAD\r?\n\s*if \(\!booking\) throw new NotFoundException\("Booking not found\."\);\r?\n\s*if \(booking\.customerId \!== customerId\) throw new ForbiddenException\("You do not have access to this booking\."\);\r?\n=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.customerId !== customerId) throw new ForbiddenException("You do not have access to this booking.");`
);

// We need to inject the booking.created into create
content = content.replace(
  /(\s*return ok\(this\.serializeBooking\(booking, days\)\);\r?\n\s*\})/,
  `
    await this.notificationsService.sendBookingNotification({
      userId: booking.customerId,
      templateKey: "booking.created",
      bookingId: booking.id,
      garmentName: null,
      startDate: booking.rentalStartDate.toISOString().slice(0, 10),
      endDate: booking.rentalEndDate.toISOString().slice(0, 10),
    });
$1`
);

// 2. Block 2: Fix #1 comment in cancel
content = content.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n\s*\/\/ Fix #1: Gi\?i phng asset d gn khi h\?y \w+\r?\n>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/g,
  ``
);
// Some text may be malformed because of encoding in the commit message:
content = content.replace(/<<<<<<< HEAD\r?\n=======\r?\n\s*\/\/ Fix #1:[^\n]+\n>>>>>>> 9df23b2[^\n]+\n/g, "");

// 3. Block 3: cancel notification
content = content.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `$1`
);
// Wait, the note has weird characters "on thu d b? h?y.". I'll fix it:
content = content.replace(/on thu d b\? h\?y\./g, "Đơn thuê đã bị huỷ.");

// 4. Block 4: updateStatus notification
content = content.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `$1`
);

// 5. Block 5: The erroneous payment_received in assignAsset
content = content.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `` // Just delete it! It was mistakenly put here.
);

// 6. Block 6: markPaid formatting
content = content.replace(
  /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `$1` // Keep HEAD version
);

// 7. Block 7: markPaid notification
content = content.replace(
  /<<<<<<< HEAD\r?\n=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `$1` // Keep the notification
);

// 8. Block 8: cancelExpiredAwaitingPayments notification
content = content.replace(
  /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n([\s\S]*?)>>>>>>> 9df23b2 \(hoan thien login,cấu hình thông báo admin\)/,
  `
      await this.notificationsService.sendBookingNotification({
        userId: booking.customerId,
        templateKey: "booking.cancelled",
        bookingId: booking.id,
        garmentName: null,
        startDate: booking.rentalStartDate.toISOString().slice(0, 10),
        endDate: booking.rentalEndDate.toISOString().slice(0, 10),
        note: "Đơn thuê đã tự động hủy do quá hạn thanh toán.",
      });
$1`
);

fs.writeFileSync('backend/src/modules/bookings/bookings.service.ts', content, 'utf8');
console.log('Merged bookings.service.ts successfully');
