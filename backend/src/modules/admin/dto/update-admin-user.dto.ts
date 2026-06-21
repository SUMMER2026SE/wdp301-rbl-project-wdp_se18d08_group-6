import { AppRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { normalizeOptionalString } from "../../users/dto/transformers";

export class UpdateAdminUserDto {
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @IsOptional()
  @IsEnum(AppRole)
  role?: AppRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

