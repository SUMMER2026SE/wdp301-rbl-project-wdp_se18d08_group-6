import { IsNotEmpty, Matches } from "class-validator";
import { CANONICAL_UUID_REGEX } from "../../../common/validation/uuid-pattern";

export class AssignAssetDto {
  @IsNotEmpty()
  @Matches(CANONICAL_UUID_REGEX, { message: "garmentAssetId must be a UUID" })
  garmentAssetId!: string;
}
