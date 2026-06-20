import { Controller, Get, Param } from "@nestjs/common";
import { GarmentsService } from "./garments.service";

@Controller("garments")
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() { return this.garmentsService.findAll(); }

  @Get("grouped")
  findAllGrouped() { return this.garmentsService.findAllGrouped(); }

  @Get(":id")
  findOne(@Param("id") id: string) { return this.garmentsService.findOne(id); }

  @Get(":id/assets/available")
  findAvailableAssets(@Param("id") id: string) { return this.garmentsService.findAvailableAssets(id); }
}
