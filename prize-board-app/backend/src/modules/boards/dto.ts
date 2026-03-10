import { IsInt, IsNumber, IsString, Min } from 'class-validator';

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
}
