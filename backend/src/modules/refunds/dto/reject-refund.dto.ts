import { IsOptional, IsString } from "class-validator";

export class RejectRefundDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
