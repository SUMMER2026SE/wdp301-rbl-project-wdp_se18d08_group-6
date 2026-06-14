import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyEmailDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: "Email không hợp lệ." })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Mã OTP không được để trống." })
  @Length(6, 6, { message: "Mã OTP phải đúng 6 ký tự." })
  code!: string;
}
