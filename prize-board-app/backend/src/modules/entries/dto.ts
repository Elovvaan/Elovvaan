import { IsUUID } from 'class-validator';

export class CreateEntryDto {
  @IsUUID()
  paymentId!: string;
}
