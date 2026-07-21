import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AssetsService } from "./assets.service";
import { CreateAssetDto } from "./dto/create-asset.dto";
import { UpdateAssetStatusDto } from "./dto/update-asset-status.dto";

@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("staff", "manager_owner", "admin")
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAll(@Query("status") status?: string) {
    return this.assetsService.findAll(status);
  }

  @Get("by-garment/:garmentId")
  findAllByGarment(@Param("garmentId", ParseUUIDPipe) garmentId: string) {
    return this.assetsService.findAllByGarment(garmentId);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.assetsService.findOne(id);
  }

  @Get(":id/inspections")
  findInspectionHistory(@Param("id", ParseUUIDPipe) id: string) {
    return this.assetsService.findInspectionHistory(id);
  }

  @Post()
  @Roles("manager_owner", "admin")
  create(@Body() dto: CreateAssetDto) {
    return this.assetsService.create(dto);
  }

  @Patch(":id/status")
  @Roles("manager_owner", "admin")
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetStatusDto,
  ) {
    return this.assetsService.updateStatus(id, dto);
  }
}
