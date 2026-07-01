import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import type { AuthenticatedUser } from "../auth/auth-user";
import { AiService } from "./ai.service";
import { CreateTryonDto } from "./dto/create-tryon.dto";
import { ProductAdvisorDto } from "./dto/product-advisor.dto";

@Controller("ai")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("tryon")
  @UseGuards(JwtAuthGuard)
  createTryon(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTryonDto,
  ) {
    return this.aiService.createTryon(body, user.id);
  }

  @Get("tryon/history")
  @UseGuards(JwtAuthGuard)
  getMyHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.aiService.getMyHistory(user.id);
  }

  @Patch("tryon/results/:id/hide")
  @UseGuards(JwtAuthGuard)
  hideResult(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.aiService.hideResult(id, user.id);
  }

  @Post("product-advisor")
  productAdvisor(@Body() body: ProductAdvisorDto) {
    return this.aiService.productAdvisor(body);
  }
}
