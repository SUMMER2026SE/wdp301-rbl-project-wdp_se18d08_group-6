import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { BookingsService } from "./bookings.service";

@Injectable()
export class BookingsScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(BookingsScheduler.name);

  constructor(private readonly bookingsService: BookingsService) {}

  // Quét bù khi server khởi động — cron chỉ chạy đúng giờ nên nếu server
  // down qua mốc 00h00 thì vẫn đánh dấu quá hạn / cộng phí khi bật lại.
  async onApplicationBootstrap() {
    await this.runOverdueScan();
  }

  // 12h00 (giờ VN) mỗi ngày: nhắc khách có đơn hết hạn thuê hôm nay trả đồ
  // trước 00h00 ngày mai.
  @Cron("0 0 12 * * *", { timeZone: "Asia/Ho_Chi_Minh" })
  async runReturnReminders() {
    try {
      const result = await this.bookingsService.sendReturnReminders();
      if (result.data?.remindedCount) {
        this.logger.log(`Đã nhắc trả đồ ${result.data.remindedCount} đơn.`);
      }
    } catch (error) {
      this.logger.error("Lỗi khi gửi nhắc trả đồ", error instanceof Error ? error.stack : String(error));
    }
  }

  // 00h00 (giờ VN) mỗi ngày: đánh dấu quá hạn các đơn chưa trả và cộng dồn
  // phí phạt 10.000đ/ngày cho các đơn đang quá hạn.
  @Cron("0 0 0 * * *", { timeZone: "Asia/Ho_Chi_Minh" })
  async runOverdueScan() {
    try {
      const result = await this.bookingsService.markOverdueBookings();
      if (result.data?.markedCount || result.data?.accruedCount) {
        this.logger.log(
          `Quét quá hạn: đánh dấu ${result.data.markedCount} đơn, cộng phí ${result.data.accruedCount} đơn.`,
        );
      }
    } catch (error) {
      this.logger.error("Lỗi khi quét đơn quá hạn", error instanceof Error ? error.stack : String(error));
    }
  }
}
