import { IsObject } from "class-validator";

export class UpdateNotificationTemplatesDto {
  @IsObject()
  templates!: Record<string, unknown>;
}
