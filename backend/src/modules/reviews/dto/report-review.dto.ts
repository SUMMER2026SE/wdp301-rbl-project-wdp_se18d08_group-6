import { IsNotEmpty, IsString } from 'class-validator';

export class ReportReviewDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
