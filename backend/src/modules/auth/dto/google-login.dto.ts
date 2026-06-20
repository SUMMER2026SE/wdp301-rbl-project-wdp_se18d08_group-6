import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class GoogleLoginDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Google credential không được để trống." })
  idToken!: string;
}
