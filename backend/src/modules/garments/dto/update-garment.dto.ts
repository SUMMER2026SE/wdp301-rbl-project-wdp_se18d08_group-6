import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";
import { normalizeOptionalString } from "../../users/dto/transformers";
import { CANONICAL_UUID_REGEX } from "../../../common/validation/uuid-pattern";

export class UpdateGarmentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @Transform(normalizeOptionalString)
  @Matches(CANONICAL_UUID_REGEX, { message: "categoryId must be a UUID" })
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

  @IsOptional()
  @IsNumber()
  dailyPrice?: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
