import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddGarmentImageDto {
  @IsNotEmpty()
  @IsString()
  imageUrl!: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  sortOrder?: string;
}
