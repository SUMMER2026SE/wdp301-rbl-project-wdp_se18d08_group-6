import { Controller, Get } from "@nestjs/common";
import { GarmentsService } from "./garments.service";

@Controller("garments")
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() {
    return this.garmentsService.findAll();
  }
}