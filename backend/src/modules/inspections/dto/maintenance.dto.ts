import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

const ALLOWED_MAINTENANCE_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cannot_repair",
] as const;

export class CompleteMaintenanceDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(ALLOWED_MAINTENANCE_STATUSES)
  status!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
