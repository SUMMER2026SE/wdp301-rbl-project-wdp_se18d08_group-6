import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

const TRYON_MODES = ["face_swap", "full_body"] as const;
export type TryonMode = (typeof TRYON_MODES)[number];

export class CreateTryonDto {
  @IsNotEmpty()
  @IsUUID()
  garmentSizeId!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(TRYON_MODES)
  mode!: TryonMode;

  @IsNotEmpty()
  @IsString()
  imageBase64!: string;

  @IsOptional()
  @IsString()
  source?: "upload" | "camera";
}
