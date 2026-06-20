import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedUser } from "../auth/auth-user";
import { RefundsService } from "./refunds.service";
import { CreateRefundDto } from "./dto/create-refund.dto";
import { UpdateRefundStatusDto } from "./dto/update-refund.dto";

@Controller("refunds")
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Post("calculate/:bookingId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "manager_owner", "admin")
  calculate(@Param("bookingId", ParseUUIDPipe) bookingId: string) {
    return this.refundsService.calculate(bookingId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "manager_owner", "admin")
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateRefundDto,
  ) {
    return this.refundsService.create(body, user.id);
  }

  @Patch(":id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("manager_owner", "admin")
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateRefundStatusDto,
  ) {
    return this.refundsService.approve(id, body, user.id);
  }

  @Get("staff/pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "manager_owner", "admin")
  findPendingForStaff() {
    return this.refundsService.findPendingForStaff();
  }

  @Get("manager/pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("manager_owner", "admin")
  findPendingForManager() {
    return this.refundsService.findPendingForManager();
  }

  @Get("booking/:bookingId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "manager_owner", "admin")
  findByBooking(@Param("bookingId", ParseUUIDPipe) bookingId: string) {
    return this.refundsService.findByBooking(bookingId);
  }

  @Get("customer/booking/:bookingId")
  @UseGuards(JwtAuthGuard)
  findMyRefund(
    @CurrentUser() user: AuthenticatedUser,
    @Param("bookingId", ParseUUIDPipe) bookingId: string,
  ) {
    return this.refundsService.findByCustomerBooking(user.id, bookingId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "manager_owner", "admin")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.refundsService.findOne(id);
  }
}
