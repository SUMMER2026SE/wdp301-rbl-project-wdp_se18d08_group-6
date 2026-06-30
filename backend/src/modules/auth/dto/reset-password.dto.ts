import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: "Email không hợp lệ." })
  email!: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Mã OTP không được để trống." })
  otp!: string;

  @IsString()
  @MinLength(8, { message: "Mật khẩu phải có ít nhất 8 ký tự." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số.",
  })
  password!: string;
}
