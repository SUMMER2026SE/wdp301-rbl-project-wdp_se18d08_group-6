import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

const ALLOWED_ASSET_STATUSES = [
  "available",
  "laundry",
  "maintenance",
  "damaged",
  "lost",
] as const;

export type CompleteAssetStatus = (typeof ALLOWED_ASSET_STATUSES)[number];

export class CompleteInspectionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_ASSET_STATUSES)
  finalAssetStatus!: CompleteAssetStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
