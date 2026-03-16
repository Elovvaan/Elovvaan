import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { BoardsService } from './boards.service';
import { ClaimCellDto } from './dto/claim-cell.dto';

@ApiTags('boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  getBoards() {
    return this.boardsService.listBoards();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  getBoard(@Param('id') id: string) {
    return this.boardsService.getBoard(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/claim')
  claimBoardCell(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: ClaimCellDto) {
    return this.boardsService.claimCell(id, userId, dto);
  }
}
