import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
<<<<<<< HEAD
  Matches,
  IsString,
} from "class-validator";
import { Transform } from "class-transformer";
import { normalizeOptionalString } from "../../users/dto/transformers";
import { CANONICAL_UUID_REGEX } from "../../../common/validation/uuid-pattern";
=======
  IsString,
  IsUUID,
} from "class-validator";
>>>>>>> 6fb0177 (role manager)

export class UpdateGarmentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
<<<<<<< HEAD
  @Transform(normalizeOptionalString)
  @Matches(CANONICAL_UUID_REGEX, { message: "categoryId must be a UUID" })
=======
  @IsUUID()
>>>>>>> 6fb0177 (role manager)
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
