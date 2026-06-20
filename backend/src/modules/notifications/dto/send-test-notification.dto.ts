import { IsEmail, IsObject, IsOptional, IsString } from "class-validator";

export class SendTestNotificationDto {
  @IsEmail()
  email!: string;

  @IsString()
  templateKey!: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}
