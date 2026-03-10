import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsUUID()
  boardId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  entryQuantity?: number;
}
