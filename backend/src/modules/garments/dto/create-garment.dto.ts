import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateGarmentDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sizeLabel?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsNumber()
  dailyPrice!: number;

  @IsNumber()
  depositAmount!: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
