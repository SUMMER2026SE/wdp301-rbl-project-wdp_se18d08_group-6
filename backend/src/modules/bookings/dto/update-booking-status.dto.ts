import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { BookingStatus } from "@prisma/client";

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
