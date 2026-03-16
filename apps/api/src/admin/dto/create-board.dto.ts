import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BoardStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BoardStatus, default: BoardStatus.DRAFT })
  @IsEnum(BoardStatus)
  status!: BoardStatus;

  @ApiProperty({ minimum: 0 })
  @Min(0)
  pricePerEntry!: number;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  totalCells!: number;
}
