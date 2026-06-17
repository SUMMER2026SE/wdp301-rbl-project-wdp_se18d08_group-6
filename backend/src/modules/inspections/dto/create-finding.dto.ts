import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateFindingDto {
  @IsNotEmpty()
  @IsString()
  findingType!: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  penaltyAmount?: number;
}
