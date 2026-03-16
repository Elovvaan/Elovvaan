import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ClaimCellDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  cellNumber!: number;
}
