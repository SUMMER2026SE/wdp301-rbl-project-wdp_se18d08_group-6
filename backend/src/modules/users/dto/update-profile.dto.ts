import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { normalizeOptionalString } from "./transformers";

export class UpdateProfileDto {
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  fullName?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  phone?: string | null;
}
