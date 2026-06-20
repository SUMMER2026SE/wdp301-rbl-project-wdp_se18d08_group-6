import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

const REFUND_METHODS = ["cash", "bank_transfer"] as const;
export type RefundMethod = (typeof REFUND_METHODS)[number];

export class CreateRefundDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId!: string;

  @IsNotEmpty()
  @IsString()
  @IsIn(REFUND_METHODS)
  refundMethod!: RefundMethod;

  @IsOptional()
  @IsString()
  reason?: string;

  // Required only for bank_transfer
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountHolder?: string;
}
