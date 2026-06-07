# Đặc tả dự án ERP cho thuê cổ phục, áo dài Việt Nam và phòng thử đồ ảo AI

## 1. Định hướng đã chốt

Dự án hướng đến cửa hàng cho thuê cổ phục và áo dài Việt Nam quy mô vừa và nhỏ. Đây là dự án tốt nghiệp của nhóm 5 người, vì vậy phạm vi nên đủ chuyên nghiệp để thể hiện tính ERP nhưng không nên quá nặng như hệ thống kế toán doanh nghiệp lớn.

Lựa chọn kiến trúc nghiệp vụ chính:

- Không tách actor Accountant riêng.
- Gộp các nghiệp vụ đối soát tiền, hoàn cọc, khấu trừ cọc, báo cáo doanh thu vào Manager/Owner.
- Không tách Warehouse/Laundry Staff riêng trong MVP. Các nghiệp vụ kho, giặt, sửa được gộp vào Staff.
- Admin tập trung vào quản trị hệ thống, tài khoản, phân quyền, cấu hình AI/payment.
- Manager/Owner tập trung vào nghiệp vụ cửa hàng: sản phẩm, giá thuê, chính sách cọc/phạt, nhân viên, báo cáo, tài chính cơ bản.
- Module tài chính nên gọi là Financial Management thay vì Accounting Management.
- Database nên dùng PAYMENT, REFUND, PENALTY, FINANCIAL_TRANSACTION thay vì làm kế toán double-entry phức tạp với LEDGER_ACCOUNT, LEDGER_JOURNAL, LEDGER_ENTRY.

Actor đề xuất cho use case diagram:

1. Guest.
2. Customer.
3. Staff.
4. Manager/Owner.
5. Admin.
6. AI Service.
7. Payment Gateway.
8. Notification Service, có thể để optional nếu diagram quá rối.

Nếu muốn giản lược hơn khi vẽ diagram chính, có thể dùng:

1. Customer.
2. Staff.
3. Manager/Owner.
4. Admin.
5. AI Service.
6. Payment Gateway.

## 2. Tên đề tài

Hệ thống ERP Quản trị Cho thuê Trang phục Truyền thống và Phòng thử đồ Ảo AI.

Domain nghiệp vụ nên thống nhất là cổ phục và áo dài Việt Nam. Không nên dùng ví dụ lệch domain như vest, hanbok, cosplay nếu không phải phạm vi chính của đề tài.

## 3. Mục tiêu hệ thống

Hệ thống hỗ trợ cửa hàng cho thuê trang phục truyền thống Việt Nam quản lý quy trình từ trưng bày sản phẩm, tư vấn size, thử đồ ảo bằng AI, đặt thuê, đặt cọc, thanh toán, giao nhận, kiểm tra khi trả, giặt/sửa, hoàn cọc, phạt hư hỏng/trễ hạn, quản lý tài sản và báo cáo vận hành.

Mục tiêu quan trọng:

- Tránh đặt trùng cùng một tài sản trang phục trong cùng khoảng thời gian.
- Theo dõi từng món đồ vật lý thật, không chỉ mẫu trang phục chung.
- Quản lý vòng đời tài sản: available, reserved, rented, inspection, laundry, maintenance, retired.
- Quản lý tiền thuê, tiền cọc, hoàn cọc, khấu trừ cọc, phí phạt và đối soát thanh toán cơ bản.
- Hỗ trợ khách hàng thử đồ ảo bằng AI trước khi đặt thuê.
- Hỗ trợ nhân viên dùng AI để phát hiện hư hỏng khi khách trả đồ.
- Có phân quyền, audit log và báo cáo đủ để thể hiện tính ERP cho cửa hàng vừa và nhỏ.

## 4. Phạm vi sản phẩm

### 4.1. Nhóm trang phục chính

- Áo dài truyền thống.
- Áo dài cách tân.
- Áo dài cưới/hỏi.
- Nhật Bình.
- Áo Tấc.
- Áo Ngũ Thân.
- Giao Lĩnh.
- Áo bà ba hoặc trang phục dân gian nếu nhóm muốn mở rộng.
- Trang phục biểu diễn truyền thống.

### 4.2. Phụ kiện đi kèm

- Mấn.
- Khăn đóng.
- Hài/giày.
- Quạt.
- Trâm cài.
- Kiềng/vòng cổ.
- Yếm/váy lụa.
- Túi/ví cầm tay.
- Phụ kiện chụp ảnh khác.

### 4.3. Dịch vụ hỗ trợ

- Thuê theo ngày.
- Thuê theo gói chụp ảnh/sự kiện.
- Thuê combo trang phục và phụ kiện.
- Đặt lịch thử tại cửa hàng, nếu nhóm còn thời gian.
- Giao nhận tận nơi, có thể làm ở mức quản lý thông tin giao nhận, không cần tích hợp đơn vị vận chuyển thật.
- Tư vấn size dựa trên số đo.
- Thử đồ ảo bằng AI.

## 5. Actor hệ thống

### 5.1. Guest

Guest là người chưa đăng nhập. Actor này có thể được vẽ riêng hoặc gộp vào Customer tùy độ phức tạp của use case diagram.

Use case chính:

- View Clothing Catalog: xem danh mục trang phục.
- View Clothing Detail: xem chi tiết trang phục.
- Search/Filter Clothing: tìm kiếm/lọc theo loại, size, màu, giá, dịp sử dụng.
- Register Account: đăng ký tài khoản.
- Login: đăng nhập.

Giới hạn:

- Guest không được tạo đơn thuê.
- Guest không được thanh toán.
- Guest không được thử đồ AI nếu nhóm yêu cầu đăng nhập trước khi upload ảnh cá nhân.

### 5.2. Customer

Customer là khách hàng thuê trang phục.

Use case chính:

- Register Account.
- Login/Logout.
- Update Profile.
- Manage Address.
- Manage Measurement.
- View Clothing Catalog.
- View Clothing Detail.
- Check Availability.
- Virtual Try-on.
- Create Rental Order.
- Select Rental Date.
- Choose Pickup/Delivery Method.
- Pay Rental Fee.
- Deposit.
- Track Order Status.
- Cancel Order.
- Extend Rental.
- View Penalty/Deduction Result.
- Receive Deposit Refund.
- Rate Service, optional.

Thông tin Customer nên có:

- Họ tên.
- Số điện thoại.
- Email.
- Địa chỉ giao nhận.
- Chiều cao.
- Cân nặng.
- Vòng ngực.
- Vòng eo.
- Vòng mông.
- Size thường mặc.

### 5.3. Staff

Staff là nhân viên cửa hàng. Với cửa hàng vừa và nhỏ, Staff có thể xử lý cả nghiệp vụ kho, giao nhận, kiểm tra, giặt/sửa ở mức vận hành nội bộ.

Use case chính:

- View Rental Orders.
- Confirm Order.
- Reject Order.
- Assign Asset.
- Prepare Clothing.
- Pre-delivery Inspection.
- Deliver Clothing.
- Receive Returned Clothing.
- Check Clothing Condition.
- Capture Inspection Photos.
- Request AI Damage Detection.
- Confirm Damage.
- Apply Penalty Fee theo chính sách đã cấu hình.
- Deduct Deposit theo chính sách đã cấu hình.
- Create Laundry Ticket.
- Update Laundry Status.
- Create Maintenance Job.
- Update Maintenance Status.
- Update Asset Lifecycle.
- Mark Order Overdue.

Giới hạn:

- Staff không nên được sửa chính sách giá/cọc/phạt.
- Staff không nên được xóa giao dịch tiền.
- Staff có thể đề xuất khấu trừ cọc, nhưng nếu muốn chặt chẽ hơn thì Manager/Owner là người duyệt cuối.

### 5.4. Manager/Owner

Manager/Owner là chủ cửa hàng hoặc quản lý cửa hàng. Đây là actor nội bộ quan trọng nhất cho cửa hàng vừa và nhỏ. Actor này kiêm phần quản lý tài chính cơ bản thay cho Accountant.

Use case chính:

- Manage Garment Category.
- Manage Garment.
- Manage Garment Asset.
- Manage Garment Images.
- Manage Garment Set/Combo.
- Manage Rental Pricing.
- Manage Deposit Policy.
- Manage Penalty Policy.
- Manage Cancellation/Refund Policy.
- Manage Staff.
- Approve Refund, nếu cần duyệt.
- Approve High Penalty/Deduction, nếu cần duyệt.
- Reconcile Payments.
- View Revenue Report.
- View Deposit Report.
- View Inventory Report.
- View Rental Performance Report.
- View Damage/Maintenance Report.
- View Overdue Report.
- View AI Usage Report.

Nghiệp vụ tài chính của Manager/Owner:

- Kiểm tra khách đã thanh toán tiền thuê chưa.
- Kiểm tra tiền cọc đã nhận chưa.
- Xem giao dịch từ payment gateway.
- Duyệt hoặc theo dõi hoàn cọc.
- Xem khoản cọc bị khấu trừ.
- Xem phí phạt do hư hỏng/trễ hạn.
- Xem doanh thu và báo cáo tài chính cơ bản.

### 5.5. Admin

Admin là quản trị viên hệ thống, thiên về kỹ thuật và phân quyền hơn nghiệp vụ cửa hàng.

Use case chính:

- Manage User Accounts.
- Manage Roles and Permissions.
- Lock/Unlock Account.
- View Audit Log.
- Configure AI Service.
- Configure Payment Gateway.
- Configure Notification Service.
- Configure System Settings.
- Backup/Restore, optional nếu nhóm đủ thời gian.

Phân biệt Manager/Owner và Admin:

- Manager/Owner quản lý hoạt động kinh doanh của cửa hàng.
- Admin quản lý hệ thống, tài khoản, phân quyền, cấu hình tích hợp.

Trong MVP, nếu nhóm muốn đơn giản, Manager/Owner và Admin có thể dùng chung một tài khoản quyền cao, nhưng trong tài liệu vẫn nên tách để thiết kế rõ hơn.

### 5.6. AI Service

AI Service là dịch vụ AI bên ngoài hoặc module AI nội bộ.

Use case chính:

- Process Virtual Try-on.
- Return Try-on Result.
- Process Damage Detection.
- Return Damage Findings.

AI Service là external actor vì hệ thống gửi request sang AI và nhận kết quả về.

### 5.7. Payment Gateway

Payment Gateway là cổng thanh toán online bên ngoài.

Use case chính:

- Process Rental Payment.
- Process Deposit Payment.
- Send Payment Webhook.
- Process Refund, nếu nhóm có làm refund online.
- Provide Transaction Status for reconciliation.

### 5.8. Notification Service

Notification Service là dịch vụ gửi email/SMS/Zalo/push notification.

Use case chính:

- Send Order Confirmation.
- Send Payment Result.
- Send Pickup/Return Reminder.
- Send Overdue Warning.
- Send Refund/Deduction Notice.

Actor này optional trong MVP. Nếu không kịp triển khai thật, vẫn có thể mô tả là future enhancement hoặc mock notification.

## 6. Use case chi tiết theo module

### 6.1. Auth, profile và phân quyền

- Register Account: khách tạo tài khoản.
- Login: người dùng đăng nhập.
- Logout: kết thúc phiên làm việc.
- Update Profile: cập nhật họ tên, số điện thoại, email.
- Manage Address: khách quản lý địa chỉ giao nhận.
- Manage Measurement: khách cập nhật số đo cơ thể.
- Manage User Accounts: Admin quản lý tài khoản.
- Manage Roles and Permissions: Admin quản lý vai trò và quyền.
- Lock/Unlock Account: Admin khóa hoặc mở khóa tài khoản.

Role đề xuất:

- CUSTOMER.
- STAFF.
- MANAGER_OWNER.
- ADMIN.

### 6.2. Catalog và inventory

- View Clothing Catalog: xem danh sách trang phục.
- Search Clothing: tìm kiếm theo tên, loại, màu, size, giá, phong cách.
- Filter Clothing: lọc theo dịp sử dụng như cưới hỏi, chụp ảnh, lễ hội, biểu diễn.
- View Clothing Detail: xem ảnh, mô tả, size, chất liệu, phụ kiện đi kèm, giá thuê, tiền cọc.
- Check Availability: kiểm tra asset còn trống theo ngày thuê.
- Manage Garment Category: Manager/Owner quản lý loại trang phục.
- Manage Garment: Manager/Owner quản lý mẫu trang phục.
- Manage Garment Asset: Manager/Owner quản lý từng món vật lý thật bằng mã asset/barcode/QR.
- Manage Garment Images: quản lý ảnh sản phẩm dùng cho catalog và AI.
- Manage Garment Set/Combo: quản lý bộ áo dài/cổ phục và phụ kiện.
- Manage Rental Pricing: quản lý giá thuê theo ngày, theo combo hoặc theo mùa.

### 6.3. AI virtual try-on

- Create Try-on Request: Customer chọn mẫu trang phục và upload ảnh cá nhân.
- Validate Try-on Image: hệ thống kiểm tra định dạng, dung lượng, nội dung ảnh.
- Request AI Try-on: hệ thống gửi ảnh khách và ảnh trang phục sang AI Service.
- Receive Try-on Result: hệ thống nhận ảnh kết quả hoặc trạng thái thất bại.
- View Try-on Result: Customer xem kết quả thử đồ ảo.
- Delete Try-on Image: Customer hoặc hệ thống xóa ảnh theo chính sách lưu trữ.
- Track AI Usage: Manager/Owner hoặc Admin theo dõi số request, lỗi, chi phí nếu có.

Điều kiện nên có cho AI try-on:

- Có consent trước khi xử lý ảnh cá nhân.
- Có chính sách ảnh được lưu hay không, lưu bao lâu.
- Có fallback nếu AI lỗi.
- Có giới hạn định dạng và dung lượng ảnh.
- Có disclaimer: kết quả thử đồ chỉ mang tính tham khảo.

### 6.4. Booking và rental order

- Create Rental Order: Customer tạo đơn thuê.
- Add Booking Item: Customer thêm trang phục/phụ kiện vào đơn.
- Select Rental Date: Customer chọn ngày nhận và ngày trả.
- Check Availability: hệ thống bắt buộc kiểm tra asset còn trống.
- Calculate Rental Fee: hệ thống tính tiền thuê.
- Calculate Deposit: hệ thống tính tiền cọc.
- Calculate Delivery Fee: hệ thống tính phí giao nhận nếu có.
- Submit Booking: Customer gửi đơn.
- Confirm Order: Staff xác nhận đơn.
- Reject Order: Staff từ chối đơn nếu không hợp lệ hoặc không còn asset.
- Assign Asset: Staff gán asset vật lý cụ thể cho từng item.
- Cancel Order: Customer hủy đơn theo chính sách.
- Extend Rental: Customer yêu cầu gia hạn thuê.
- Approve Rental Extension: Staff hoặc Manager/Owner duyệt gia hạn nếu asset không bị booking tiếp.
- Track Order Status: Customer xem trạng thái đơn.
- Mark Overdue: hệ thống hoặc Staff đánh dấu quá hạn nếu quá ngày trả.

Trạng thái booking gợi ý:

- Draft.
- PendingConfirmation.
- Confirmed.
- AwaitingPayment.
- Paid.
- Preparing.
- ReadyForPickup.
- Delivering.
- Renting.
- Returned.
- InspectionPending.
- Completed.
- Cancelled.
- Rejected.
- Overdue.

### 6.5. Giao nhận

- Prepare Clothing: Staff chuẩn bị trang phục.
- Pre-delivery Inspection: Staff kiểm tra tình trạng trước khi giao.
- Create Delivery Record: tạo thông tin giao nhận nếu có giao tận nơi.
- Deliver Clothing: Staff bàn giao trang phục cho khách.
- Confirm Customer Received: xác nhận khách đã nhận.
- Receive Returned Clothing: Staff nhận đồ trả.
- Confirm Return Time: ghi nhận thời điểm trả để tính trễ hạn nếu có.
- Compare Accessories: kiểm tra đủ phụ kiện đi kèm.

Với đồ án, không cần tích hợp đơn vị vận chuyển thật. Chỉ cần quản lý phương thức nhận tại cửa hàng hoặc giao tận nơi, địa chỉ, phí giao và trạng thái giao nhận.

### 6.6. Kiểm tra hư hỏng, giặt và bảo trì

- Check Clothing Condition: Staff kiểm tra tình trạng sau khi trả.
- Create Inspection Session: tạo phiên kiểm tra.
- Capture Inspection Photos: chụp ảnh bằng chứng.
- AI Damage Detection: AI phát hiện rách, bẩn, mất nút, hỏng chi tiết.
- Confirm Damage: Staff xác nhận hư hỏng thật.
- Create Inspection Finding: ghi nhận từng lỗi.
- Apply Penalty Fee: áp dụng phí phạt nếu lỗi đủ nghiêm trọng.
- Deduct Deposit: khấu trừ cọc theo chính sách.
- Create Laundry Ticket: tạo phiếu giặt.
- Update Laundry Status: cập nhật đang giặt/giặt xong.
- Create Maintenance Job: tạo việc sửa chữa/bảo trì.
- Update Maintenance Status: cập nhật đang sửa/sửa xong/không thể sửa.
- Retire Asset: ngừng sử dụng asset nếu không còn đạt chuẩn.

Các loại finding gợi ý:

- Dirty.
- Torn.
- Stain.
- MissingAccessory.
- BrokenButton.
- BrokenZipper.
- ColorFading.
- SevereDamage.

### 6.7. Financial Management

Module này thay cho Accounting Management để phù hợp cửa hàng vừa và nhỏ.

Use case chính:

- Pay Rental Fee: Customer thanh toán tiền thuê.
- Deposit: Customer đặt cọc.
- Payment Webhook Handling: hệ thống nhận callback từ Payment Gateway.
- Record Financial Transaction: hệ thống ghi nhận giao dịch tài chính đơn giản.
- Refund Deposit: hoàn cọc khi đơn hoàn tất và không có vấn đề.
- Deduct Deposit: khấu trừ cọc nếu trễ hạn, hư hỏng hoặc mất phụ kiện.
- Apply Penalty Fee: tạo khoản phạt nếu vượt cọc hoặc theo chính sách.
- Reconcile Payments: Manager/Owner đối soát payment gateway với dữ liệu nội bộ.
- View Revenue Report: Manager/Owner xem doanh thu.
- View Deposit Report: Manager/Owner xem cọc đã nhận, đã hoàn, đã khấu trừ.

Trạng thái payment gợi ý:

- Pending.
- Paid.
- Failed.
- Cancelled.
- Refunding.
- Refunded.
- PartiallyRefunded.

### 6.8. Báo cáo ERP

- Revenue Report: doanh thu theo ngày/tháng/năm.
- Deposit Report: tiền cọc đang giữ, đã hoàn, đã khấu trừ.
- Rental Performance Report: trang phục được thuê nhiều nhất.
- Inventory Report: số asset available, rented, laundry, maintenance, retired.
- Damage Report: thống kê hư hỏng theo asset/category.
- Overdue Report: đơn quá hạn.
- Customer Report: khách hàng thuê nhiều, lịch sử thuê.
- AI Usage Report: số lượt try-on, số lỗi, chi phí.
- Payment Reconciliation Report: đối soát giao dịch.

## 7. Include và extend relationships gợi ý

### 7.1. Include

Include dùng cho bước luôn luôn xảy ra trong use case chính.

- Create Rental Order includes Check Availability.
- Create Rental Order includes Calculate Rental Fee.
- Create Rental Order includes Calculate Deposit.
- Submit Booking includes Validate Customer Profile.
- Confirm Order includes Assign Asset.
- Deliver Clothing includes Pre-delivery Inspection.
- Receive Returned Clothing includes Check Clothing Condition.
- Check Clothing Condition includes Create Inspection Session.
- Payment/Deposit/Penalty/Refund includes Record Financial Transaction.
- Deliver Clothing/Receive Returned Clothing/Laundry/Maintenance includes Update Asset Lifecycle.

### 7.2. Extend

Extend dùng cho trường hợp phát sinh có điều kiện.

- Check Clothing Condition extends AI Damage Detection nếu chỉ dùng AI khi cần hỗ trợ.
- Confirm Damage extends Apply Penalty Fee nếu hư hỏng đủ nghiêm trọng.
- Receive Returned Clothing extends Mark Overdue nếu khách trả trễ.
- Cancel Order extends Refund Payment nếu chính sách cho phép hoàn tiền.
- Extend Rental extends Apply Additional Rental Fee nếu gia hạn được duyệt.
- Return Inspection extends Create Maintenance Job nếu phát hiện lỗi cần sửa.
- Return Inspection extends Create Laundry Ticket nếu đồ cần giặt.

## 8. Business rules bắt buộc nên có

### 8.1. Booking và availability

- Một GARMENT_ASSET không được có hai booking trùng khoảng ngày thuê.
- Booking chỉ được xác nhận khi có ít nhất một asset phù hợp còn trống.
- Nếu booking là combo, tất cả asset trong combo phải còn trống.
- Gia hạn thuê phải kiểm tra asset đó có bị khách khác đặt trong khoảng gia hạn không.
- Booking pending quá thời gian cấu hình có thể tự hủy.

### 8.2. Tiền thuê và tiền cọc

- Tiền thuê có thể tính theo số ngày thuê, loại trang phục, combo, mùa cao điểm.
- Tiền cọc có thể là số tiền cố định hoặc phần trăm giá trị asset.
- Chỉ chuyển đơn sang trạng thái Paid khi Payment Gateway xác nhận thành công.
- Payment webhook phải xử lý idempotent để không ghi nhận giao dịch hai lần.

### 8.3. Hủy đơn và hoàn tiền

- Hủy trước ngày nhận bao nhiêu ngày thì được hoàn bao nhiêu phần trăm.
- Hủy sát ngày nhận có thể bị mất một phần tiền thuê/cọc tùy chính sách.
- Đơn đã giao không được hủy như booking bình thường, phải xử lý theo return/refund policy.

### 8.4. Trễ hạn

- Nếu khách trả sau ngày hẹn, hệ thống tính late fee.
- Late fee có thể tính theo ngày, theo phần trăm giá thuê hoặc theo chính sách từng loại trang phục.
- Nếu trễ hạn làm ảnh hưởng booking sau, Manager/Owner có thể áp dụng phí bổ sung.

### 8.5. Hư hỏng và mất phụ kiện

- Hư hỏng nhẹ có thể chỉ ghi nhận, không phạt.
- Hư hỏng vừa/nặng có thể khấu trừ cọc.
- Nếu phí phạt lớn hơn tiền cọc, hệ thống tạo khoản phải thu bổ sung.
- Mất phụ kiện phải tính phí theo bảng giá phụ kiện.
- Staff phải có ảnh bằng chứng khi áp dụng phạt.
- Manager/Owner có thể duyệt các khoản khấu trừ lớn.

### 8.6. Asset lifecycle

- Asset chỉ được cho thuê nếu ở trạng thái Available.
- Khi booking được xác nhận, asset chuyển sang Reserved.
- Khi giao cho khách, asset chuyển sang Rented.
- Khi khách trả, asset chuyển sang InspectionPending.
- Nếu cần giặt, asset chuyển sang Laundry.
- Nếu cần sửa, asset chuyển sang Maintenance.
- Khi giặt/sửa xong và đạt kiểm tra, asset chuyển lại Available.
- Nếu hỏng nặng, asset chuyển sang Retired.

## 9. Database/ERD gợi ý cho MVP

### 9.1. Nhóm user và phân quyền

- USER_ACCOUNT: tài khoản đăng nhập.
- ROLE: vai trò người dùng.
- PERMISSION: quyền chi tiết, optional nếu muốn làm RBAC sâu.
- USER_ROLE: liên kết user và role nếu một user có nhiều role.
- CUSTOMER_PROFILE: hồ sơ khách hàng.
- CUSTOMER_MEASUREMENT: số đo khách hàng.
- ADDRESS: địa chỉ giao nhận.

### 9.2. Nhóm catalog và inventory

- GARMENT_CATEGORY: danh mục trang phục.
- GARMENT: mẫu trang phục chung.
- GARMENT_IMAGE: ảnh mẫu trang phục.
- GARMENT_SIZE: size hỗ trợ.
- GARMENT_ASSET: món đồ vật lý thật.
- ACCESSORY: phụ kiện.
- GARMENT_SET: combo/bộ trang phục, optional cho MVP.
- GARMENT_SET_ITEM: item trong combo, optional cho MVP.
- STATE_TRANSITION_LOG: lịch sử đổi trạng thái tài sản.

### 9.3. Nhóm booking/rental

- BOOKING: đơn thuê.
- BOOKING_ITEM: từng dòng trang phục/phụ kiện trong đơn.
- BOOKING_STATUS_HISTORY: lịch sử trạng thái đơn.
- RENTAL_EXTENSION_REQUEST: yêu cầu gia hạn, optional.
- DELIVERY_RECORD: thông tin giao nhận.
- RETURN_RECORD: thông tin trả đồ.

### 9.4. Nhóm financial management

- PAYMENT: giao dịch thanh toán.
- REFUND: giao dịch hoàn tiền/cọc.
- PENALTY: khoản phạt.
- FINANCIAL_TRANSACTION: lịch sử giao dịch tài chính đơn giản.
- INVOICE: hóa đơn/biên nhận, optional.

Ghi chú: không nên bắt buộc làm LEDGER_ACCOUNT, LEDGER_JOURNAL, LEDGER_ENTRY trong MVP vì nhóm 5 người sẽ dễ bị quá tải. Nếu muốn thể hiện ERP, FINANCIAL_TRANSACTION cộng với báo cáo doanh thu/cọc/phạt là đủ hợp lý cho cửa hàng vừa và nhỏ.

### 9.5. Nhóm inspection/maintenance

- INSPECTION_SESSION: phiên kiểm tra đồ.
- INSPECTION_FINDING: lỗi phát hiện.
- INSPECTION_PHOTO: ảnh bằng chứng.
- MAINTENANCE_JOB: việc sửa chữa/bảo trì.
- LAUNDRY_TICKET: phiếu giặt.
- DAMAGE_POLICY: chính sách tính phí hư hỏng.

### 9.6. Nhóm AI

- TRYON_REQUEST: request thử đồ ảo.
- TRYON_RESULT: kết quả thử đồ ảo.
- AI_DAMAGE_DETECTION_REQUEST: request AI kiểm tra hư hỏng.
- AI_DAMAGE_DETECTION_RESULT: kết quả AI kiểm tra hư hỏng.
- AI_USAGE_LOG: log số lượt, trạng thái, chi phí nếu có.

### 9.7. Nhóm notification/audit

- NOTIFICATION: thông báo đã gửi hoặc cần gửi.
- AUDIT_LOG: log thao tác quan trọng.
- SYSTEM_SETTING: cấu hình hệ thống.

## 10. Quan hệ dữ liệu quan trọng

- GARMENT_CATEGORY 1-n GARMENT.
- GARMENT 1-n GARMENT_ASSET.
- GARMENT 1-n GARMENT_IMAGE.
- GARMENT 1-n GARMENT_SIZE.
- USER_ACCOUNT 1-1 CUSTOMER_PROFILE với user là customer.
- CUSTOMER_PROFILE 1-n CUSTOMER_MEASUREMENT.
- CUSTOMER_PROFILE 1-n ADDRESS.
- BOOKING 1-n BOOKING_ITEM.
- BOOKING_ITEM n-1 GARMENT_ASSET nếu đã gán asset cụ thể.
- BOOKING_ITEM n-1 GARMENT nếu ban đầu khách chỉ chọn mẫu.
- BOOKING 1-n PAYMENT.
- BOOKING 0-n REFUND.
- BOOKING 0-n PENALTY.
- PAYMENT 1-n FINANCIAL_TRANSACTION.
- REFUND 1-n FINANCIAL_TRANSACTION.
- PENALTY 1-n FINANCIAL_TRANSACTION.
- GARMENT_ASSET 1-n INSPECTION_SESSION.
- INSPECTION_SESSION 1-n INSPECTION_FINDING.
- INSPECTION_SESSION 1-n INSPECTION_PHOTO.
- INSPECTION_FINDING 0-n MAINTENANCE_JOB nếu lỗi cần sửa.
- USER_ACCOUNT 1-n TRYON_REQUEST.
- GARMENT 1-n TRYON_REQUEST.
- USER_ACCOUNT 1-n AUDIT_LOG.

## 11. Trạng thái gợi ý

### 11.1. GARMENT_ASSET status

- Available: sẵn sàng cho thuê.
- Reserved: đã được giữ cho booking.
- Rented: đang ở chỗ khách.
- InspectionPending: chờ kiểm tra sau khi trả.
- Laundry: đang giặt.
- Maintenance: đang sửa/bảo trì.
- Damaged: hư hỏng, chưa xử lý.
- Retired: ngừng sử dụng.
- Lost: thất lạc/mất.

### 11.2. BOOKING status

- Draft.
- PendingConfirmation.
- Confirmed.
- AwaitingPayment.
- Paid.
- Preparing.
- ReadyForPickup.
- Delivering.
- Renting.
- Returned.
- InspectionPending.
- Completed.
- Cancelled.
- Rejected.
- Overdue.

### 11.3. PAYMENT status

- Pending.
- Paid.
- Failed.
- Cancelled.
- Refunding.
- Refunded.
- PartiallyRefunded.

### 11.4. INSPECTION status

- Pending.
- InProgress.
- Completed.
- Disputed.

### 11.5. MAINTENANCE status

- Open.
- InProgress.
- Completed.
- CannotRepair.

## 12. Scope MVP đề xuất cho nhóm 5 người

### 12.1. Phase 1: Core rental, bắt buộc

- Đăng ký/đăng nhập.
- Phân quyền Customer, Staff, Manager/Owner, Admin.
- Catalog áo dài/cổ phục.
- Quản lý GARMENT và GARMENT_ASSET.
- Tạo booking theo ngày thuê.
- Check availability.
- Tính tiền thuê và tiền cọc.
- Thanh toán basic hoặc giả lập payment.
- Staff xác nhận đơn.
- Staff giao đồ.
- Staff nhận đồ trả.
- Cập nhật trạng thái asset.

### 12.2. Phase 2: ERP operation, nên có

- Kiểm tra tình trạng khi trả.
- Ảnh bằng chứng khi phát hiện lỗi.
- Phạt hư hỏng/trễ hạn.
- Hoàn cọc/khấu trừ cọc.
- Phiếu giặt.
- Phiếu sửa chữa.
- Báo cáo doanh thu.
- Báo cáo tồn kho.
- Audit log cơ bản.

### 12.3. Phase 3: AI features, điểm nổi bật

- Virtual try-on.
- Lưu TRYON_REQUEST và TRYON_RESULT.
- Consent xử lý ảnh.
- AI damage detection ở mức hỗ trợ Staff.
- Log lỗi AI và fallback.

### 12.4. Optional/future enhancement

- Tích hợp giao hàng thật.
- Hóa đơn điện tử thật.
- Kế toán double-entry.
- Nhiều chi nhánh/kho.
- Loyalty point.
- Voucher nâng cao.
- CRM khách hàng nâng cao.
- Dynamic pricing phức tạp.

## 13. Gợi ý phân công nhóm 5 người

### Thành viên 1: Auth, role, profile

Phụ trách:

- Login/register.
- Role Customer/Staff/Manager/Admin.
- Customer profile.
- Measurement.
- Address.
- Permission guard.

### Thành viên 2: Catalog và inventory

Phụ trách:

- Garment category.
- Garment.
- Garment image.
- Garment size.
- Garment asset.
- Asset lifecycle.
- State transition log.

### Thành viên 3: Booking và availability

Phụ trách:

- Rental order.
- Booking item.
- Select rental date.
- Check availability.
- Prevent double-booking.
- Booking status history.
- Extend rental/cancel order nếu đủ thời gian.

Đây là module rủi ro nhất, nên cần người chắc logic backend/database.

### Thành viên 4: Staff operation và financial management

Phụ trách:

- Confirm/reject order.
- Deliver clothing.
- Receive returned clothing.
- Inspection session.
- Penalty.
- Deposit deduction.
- Refund.
- Payment/financial transaction.
- Basic reports.

### Thành viên 5: AI và UI integration

Phụ trách:

- Virtual try-on UI.
- Try-on request/result.
- AI damage detection request/result.
- Consent upload ảnh.
- Fallback khi AI lỗi.
- Dashboard UI polish nếu cần.

Ghi chú: AI có thể phối hợp với thành viên 2 vì cần ảnh sản phẩm, và thành viên 4 vì cần ảnh kiểm tra hư hỏng.

## 14. Production-like checklist cho đồ án

Trước khi demo/bảo vệ, tối thiểu nên có:

- Use case đúng domain cổ phục/áo dài Việt Nam.
- Có phân quyền rõ cho Customer, Staff, Manager/Owner, Admin.
- Không cho phép double-book cùng một asset trong cùng thời gian.
- Có logic kiểm tra availability khi tạo đơn và khi gia hạn.
- Có trạng thái booking và asset rõ ràng.
- Có payment basic hoặc payment gateway mock/real.
- Có xử lý payment webhook nếu dùng cổng thanh toán thật.
- Có Record Financial Transaction cho tiền thuê, cọc, phạt, refund.
- Có audit log cho thanh toán, refund, phạt, đổi trạng thái asset.
- Có chính sách cọc, hủy đơn, hoàn tiền, trễ hạn, hư hỏng.
- Có ảnh bằng chứng khi Staff áp dụng phạt.
- Có quy trình giặt/sửa trước khi asset quay lại Available.
- Có consent xử lý ảnh cá nhân cho AI try-on.
- Có chính sách lưu/xóa ảnh khách hàng.
- Có fallback khi AI hoặc payment gateway lỗi.
- Có notification hoặc mock notification cho các mốc quan trọng.
- Có báo cáo doanh thu, tồn kho, đơn quá hạn, hư hỏng.
- Có test cho các luồng chính: booking, payment, return, penalty, refund, AI error.

## 15. Những điểm cần sửa trong use case hiện tại

- Đổi ví dụ vest/hanbok/cosplay thành áo dài, Nhật Bình, Áo Tấc, Ngũ Thân, phụ kiện truyền thống Việt Nam.
- Xóa actor Accountant riêng.
- Gộp chức năng đối soát, hoàn cọc, báo cáo tài chính vào Manager/Owner.
- Không tách Warehouse/Laundry Staff trong MVP, gộp vào Staff.
- Đổi Accounting Management thành Financial Management.
- Đổi Record Accounting Transaction thành Record Financial Transaction.
- Không bắt buộc dùng LEDGER_ACCOUNT, LEDGER_JOURNAL, LEDGER_ENTRY.
- Dùng PAYMENT, REFUND, PENALTY, FINANCIAL_TRANSACTION cho MVP.
- Thêm Customer Measurement, Manage Address, Check Availability, Delivery Record, Refund Policy.
- Làm rõ Virtual Try-on gồm upload ảnh, consent, AI xử lý, kết quả, xóa ảnh.
- Sửa quan hệ AI Damage Detection: nên là Check Clothing Condition extend AI Damage Detection nếu AI không luôn luôn chạy.
- Thêm business rules cho cọc, phạt, trễ hạn, hủy đơn, hoàn tiền, double-booking.

## 16. Định nghĩa thành công của hệ thống

Hệ thống được xem là đủ tốt để demo production-like khi:

- Khách có thể xem áo dài/cổ phục, thử đồ ảo, đặt thuê và thanh toán/cọc.
- Staff có thể xác nhận đơn, giao đồ, nhận trả và kiểm tra tình trạng.
- Hệ thống không cho thuê trùng một asset trong cùng khoảng thời gian.
- Asset thay đổi trạng thái đúng theo vòng đời.
- Tiền thuê, cọc, phạt và hoàn cọc được ghi nhận rõ bằng Financial Transaction.
- Manager/Owner có thể xem báo cáo và theo dõi tình hình cửa hàng.
- Admin có thể quản lý user, role, permission và cấu hình hệ thống.
- Ảnh khách hàng dùng cho AI được xử lý có consent và có chính sách lưu trữ/xóa.

## 17. Kết luận khuyến nghị

Với nhóm 5 người và dự án tốt nghiệp, scope hợp lý nhất là:

- Customer.
- Staff.
- Manager/Owner.
- Admin.
- AI Service.
- Payment Gateway.
- Notification Service optional.

Không nên tách Accountant riêng. Không nên làm kế toán double-entry quá sâu. Cách làm phù hợp hơn là giữ Financial Management ở mức tiền thuê, cọc, phạt, hoàn cọc, đối soát và báo cáo doanh thu cơ bản.

Cách chọn này đủ chuyên nghiệp để bảo vệ tốt nghiệp, đủ sát nghiệp vụ cửa hàng cho thuê vừa và nhỏ, nhưng vẫn nằm trong khả năng triển khai của nhóm 5 người.
