import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

export class ChatHistoryItemDto {
  @IsIn(["customer", "staff", "ai"])
  role!: "customer" | "staff" | "ai";

  @IsString()
  @MaxLength(1000)
  content!: string;

  @IsString()
  createdAt!: string;
}

export class ProductAdvisorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message!: string;

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];

  @IsDateString()
  @IsOptional()
  rentalStartDate?: string;

  @IsDateString()
  @IsOptional()
  rentalEndDate?: string;
}
