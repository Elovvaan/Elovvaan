import { IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, Min } from 'class-validator';

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
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prizeValue?: number;

  @IsOptional()
  @IsUrl()
  prizeImageUrl?: string;
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
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  prizeValue?: number;

  @IsOptional()
  @IsUrl()
  prizeImageUrl?: string;
}

