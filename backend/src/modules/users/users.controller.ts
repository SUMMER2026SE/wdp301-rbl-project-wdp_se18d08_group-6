import { AppRole } from "@prisma/client";
import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import type { AuthenticatedUser } from "../auth/auth-user";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateMeasurementsDto } from "./dto/update-measurements.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch("me/profile")
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Get("me/measurements")
  @Roles(AppRole.customer)
  getMeasurements(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMeasurements(user.id);
  }

  @Patch("me/measurements")
  @Roles(AppRole.customer)
  updateMeasurements(@CurrentUser() user: AuthenticatedUser, @Body() body: UpdateMeasurementsDto) {
    return this.usersService.updateMeasurements(user.id, body);
  }

  @Post("me/addresses")
  @Roles(AppRole.customer)
  createAddress(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateAddressDto) {
    return this.usersService.createAddress(user.id, body);
  }

  @Get("me/addresses")
  @Roles(AppRole.customer)
  listAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listAddresses(user.id);
  }
}
