import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateInspectionDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId!: string;

  @IsNotEmpty()
  @IsUUID()
  garmentAssetId!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
