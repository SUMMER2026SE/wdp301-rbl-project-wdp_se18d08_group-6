import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { CANONICAL_UUID_REGEX } from "../../../common/validation/uuid-pattern";

export class CreateInspectionDto {
  @IsNotEmpty()
  @Matches(CANONICAL_UUID_REGEX, { message: "bookingId must be a UUID" })
  bookingId!: string;

  @IsNotEmpty()
  @Matches(CANONICAL_UUID_REGEX, { message: "garmentAssetId must be a UUID" })
  garmentAssetId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
