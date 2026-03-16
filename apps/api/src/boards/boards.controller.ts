import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  list() {
    return this.boardsService.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.boardsService.details(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateBoardDto) {
    return this.boardsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.boardsService.join(user.id, id);
  }
}
