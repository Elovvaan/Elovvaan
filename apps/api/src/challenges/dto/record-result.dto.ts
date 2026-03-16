import { IsString } from 'class-validator';

export class RecordResultDto {
  @IsString()
  winnerUserId!: string;

  @IsString()
  score!: string;
}
