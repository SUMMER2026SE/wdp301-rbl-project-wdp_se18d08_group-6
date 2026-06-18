import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateAssetDto {
  @IsNotEmpty()
  @IsUUID()
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
