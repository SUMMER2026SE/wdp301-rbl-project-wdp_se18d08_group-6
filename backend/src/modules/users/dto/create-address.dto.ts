import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { normalizeOptionalString, trimRequiredString } from "./transformers";

export class CreateAddressDto {
  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  receiverName!: string;

  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Transform(trimRequiredString)
  @IsString()
  @IsNotEmpty()
  line1!: string;

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
