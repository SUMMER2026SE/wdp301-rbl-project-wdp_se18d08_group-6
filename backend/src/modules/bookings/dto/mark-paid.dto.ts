import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

const PAYMENT_METHODS = ["cash", "bank_transfer", "qr_code", "pos_card", "online"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export class MarkPaidDto {
  @IsOptional()
  @IsString()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}
