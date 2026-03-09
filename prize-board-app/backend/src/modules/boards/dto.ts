import { IsInt, IsNumber, IsString, IsUrl, Min } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title!: string;

  @IsString()
  prizeName!: string;

  @IsUrl()
  prizeImageUrl!: string;

  @IsNumber()
  @Min(0.5)
  entryPrice!: number;

  @IsInt()
  @Min(1)
  totalSpots!: number;
}
