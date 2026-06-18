import { IsOptional, IsString } from "class-validator";

export class CompleteLaundryDto {
  @IsOptional()
  @IsString()
  note?: string;
}
