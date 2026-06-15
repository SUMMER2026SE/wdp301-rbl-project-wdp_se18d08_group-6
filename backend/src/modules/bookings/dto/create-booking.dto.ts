import { IsDateString, IsOptional, IsString, Matches, MaxLength } from "class-validator";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateBookingDto {
  @Matches(UUID_REGEX, { message: "garmentId must be a UUID" })
  garmentId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsString()
  pickupMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
