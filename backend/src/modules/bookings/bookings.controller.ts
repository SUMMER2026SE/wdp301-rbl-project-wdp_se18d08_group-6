import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/auth-user";
import { BookingsService } from "./bookings.service";
import { CheckAvailabilityDto } from "./dto/check-availability.dto";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Public — không cần đăng nhập để kiểm tra lịch trống
  @Post("check-availability")
  checkAvailability(@Body() body: CheckAvailabilityDto) {
    return this.bookingsService.checkAvailability(body);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateBookingDto) {
    return this.bookingsService.create(user.id, body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingsService.findMine(user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  findOne(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(user.id, id);
  }

  @Patch(":id/cancel")
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: AuthenticatedUser, @Param("id", ParseUUIDPipe) id: string) {
    return this.bookingsService.cancel(user.id, id);
  }
}
