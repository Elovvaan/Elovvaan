import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  boardId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  entryQuantity?: number;

  @IsOptional()
  @IsString()
  affiliateCode?: string;

  @IsOptional()
  @IsString()
  paymentMethodFingerprint?: string;
}
