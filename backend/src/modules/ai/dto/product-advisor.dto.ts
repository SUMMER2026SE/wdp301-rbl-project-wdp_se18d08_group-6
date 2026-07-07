import { IsArray, IsDateString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class ProductAdvisorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;

  @IsArray()
  @IsOptional()
  history?: Array<{ role: "customer" | "staff" | "ai"; content: string; createdAt: string }>;

  @IsDateString()
  @IsOptional()
  rentalStartDate?: string;

  @IsDateString()
  @IsOptional()
  rentalEndDate?: string;
}
