import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { BookingsController } from "./bookings.controller";
import { BookingsScheduler } from "./bookings.scheduler";
import { BookingsService } from "./bookings.service";

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsScheduler],
})
export class BookingsModule {}
