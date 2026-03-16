import { ChallengeType } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryId!: string;

  @IsEnum(ChallengeType)
  type!: ChallengeType;

  @IsOptional()
  @IsString()
  calledOutUserId?: string;

  @IsNumber()
  @Min(0)
  entryFee!: number;
}
