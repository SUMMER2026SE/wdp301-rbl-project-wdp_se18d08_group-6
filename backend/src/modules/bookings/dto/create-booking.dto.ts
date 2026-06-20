import { ArrayMinSize, IsArray, IsDateString, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateBookingDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  garmentSizeIds!: string[];

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
