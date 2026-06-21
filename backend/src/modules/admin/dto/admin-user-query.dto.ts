import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, Max, Min } from "class-validator";
import { AppRole } from "@prisma/client";

const DEFAULT_LIMIT = 20;

function toPageNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? Math.trunc(next) : 1;
}

export class AdminUserQueryDto {
  @Transform(({ value }) => toPageNumber(value))
  @IsOptional()
  @Min(1)
  page = 1;

  @Transform(({ value }) => toPageNumber(value))
  @IsOptional()
  @Min(1)
  @Max(100)
  limit = DEFAULT_LIMIT;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  search?: string;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsIn(["customer", "staff", "manager_owner", "admin"])
  role?: AppRole;

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsIn(["all", "active", "inactive"])
  status?: "all" | "active" | "inactive";
}

