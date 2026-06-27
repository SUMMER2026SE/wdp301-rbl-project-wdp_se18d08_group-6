import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { normalizeOptionalString, trimRequiredString } from "./transformers";

export class UpdateAddressDto {
  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  receiverName?: string;

  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  line1?: string;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  ward?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  district?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
