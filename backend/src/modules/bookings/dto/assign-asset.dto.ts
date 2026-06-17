import { IsNotEmpty, IsUUID } from "class-validator";

export class AssignAssetDto {
  @IsNotEmpty()
  @IsUUID()
  garmentAssetId!: string;
}
