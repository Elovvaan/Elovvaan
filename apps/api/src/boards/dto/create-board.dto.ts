import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  categoryId!: string;

  @IsNumber()
  @Min(0)
  entryFee!: number;

  @IsNumber()
  @Min(0)
  prizePool!: number;

  @IsInt()
  @Min(2)
  spotCount!: number;
}
