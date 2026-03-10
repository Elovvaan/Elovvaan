import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  list() {
    return this.boardsService.list();
  }

  @Get('trending')
  trending() {
    return this.boardsService.trending();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.boardsService.get(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateBoardDto) {
    return this.boardsService.create(dto);
  }
}
