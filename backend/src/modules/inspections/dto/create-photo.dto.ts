import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePhotoDto {
  @IsNotEmpty()
  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
