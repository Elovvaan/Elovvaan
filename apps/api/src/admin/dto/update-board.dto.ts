import { ApiPropertyOptional } from '@nestjs/swagger';
import { BoardStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateBoardDto {
  @ApiPropertyOptional({ enum: BoardStatus })
  @IsOptional()
  @IsEnum(BoardStatus)
  status?: BoardStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
