import { IsDateString, Matches } from "class-validator";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CheckAvailabilityDto {
  @Matches(UUID_REGEX, { message: "garmentId must be a UUID" })
  garmentId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;
}
