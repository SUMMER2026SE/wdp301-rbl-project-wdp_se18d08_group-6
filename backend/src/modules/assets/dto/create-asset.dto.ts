import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
<<<<<<< HEAD
  Matches,
} from "class-validator";
import { CANONICAL_UUID_REGEX } from "../../../common/validation/uuid-pattern";

export class CreateAssetDto {
  @IsNotEmpty()
  @Matches(CANONICAL_UUID_REGEX, { message: "garmentId must be a UUID" })
=======
  IsUUID,
} from "class-validator";

export class CreateAssetDto {
  @IsNotEmpty()
  @IsUUID()
>>>>>>> 6fb0177 (role manager)
  garmentId!: string;

  @IsNotEmpty()
  @IsString()
  assetCode!: string;

  @IsOptional()
  @IsString()
  conditionNote?: string;

  @IsOptional()
  @IsNumber()
  purchaseCost?: number;
}
