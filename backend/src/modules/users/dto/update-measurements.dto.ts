import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import { normalizeOptionalNumber, normalizeOptionalString } from "./transformers";

export class UpdateMeasurementsDto {
  @Transform(normalizeOptionalNumber)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  heightCm?: number | null;

  @Transform(normalizeOptionalNumber)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weightKg?: number | null;

  @Transform(normalizeOptionalNumber)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  bustCm?: number | null;

  @Transform(normalizeOptionalNumber)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  waistCm?: number | null;

  @Transform(normalizeOptionalNumber)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hipCm?: number | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  usualSize?: string | null;
}
