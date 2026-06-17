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
import { CreateInspectionDto } from "./dto/create-inspection.dto";
import { CreateFindingDto } from "./dto/create-finding.dto";
import { CreatePhotoDto } from "./dto/create-photo.dto";
import { CompleteInspectionDto } from "./dto/complete-inspection.dto";
import { InspectionsService } from "./inspections.service";

@Controller("inspections")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("staff", "manager_owner", "admin")
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateInspectionDto,
  ) {
    return this.inspectionsService.createOrGet(body, user.id);
  }

  @Get("booking/:bookingId")
  findByBooking(@Param("bookingId", ParseUUIDPipe) bookingId: string) {
    return this.inspectionsService.findByBooking(bookingId);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Post(":id/findings")
  addFinding(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CreateFindingDto,
  ) {
    return this.inspectionsService.addFinding(id, body);
  }

  @Post(":id/photos")
  addPhoto(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CreatePhotoDto,
  ) {
    return this.inspectionsService.addPhoto(id, body);
  }

  @Patch(":id/complete")
  complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: CompleteInspectionDto,
  ) {
    return this.inspectionsService.complete(id, body, user.id);
  }
}
