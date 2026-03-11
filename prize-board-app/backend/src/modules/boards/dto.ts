import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  pricePerEntry!: number;

  @IsInt()
  @Min(1)
  maxEntries!: number;

  @IsOptional()
  @IsString()
  prizeDescription?: string;
}

export class CreateCreatorBoardDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  entryPrice!: number;

  @IsInt()
  @Min(1)
  maxEntries!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  platformFeePercent!: number;

  @IsString()
  prizeDescription!: string;
}
