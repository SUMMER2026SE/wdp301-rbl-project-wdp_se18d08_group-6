import { Controller, Get, Param, ParseUUIDPipe } from "@nestjs/common";
import { GarmentsService } from "./garments.service";

@Controller("garments")
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() {
    return this.garmentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.garmentsService.findOne(id);
  }

  @Get(":id/assets/available")
  findAvailableAssets(@Param("id", ParseUUIDPipe) id: string) {
    return this.garmentsService.findAvailableAssets(id);
  }
}