import { Body, Controller, Get, Headers, Param, Post, UnauthorizedException } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  list() {
    return this.boardsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.boardsService.get(id);
  }

  @Post()
  create(@Body() dto: CreateBoardDto, @Headers('x-admin-key') adminKey?: string) {
    if (adminKey !== 'dev-admin') throw new UnauthorizedException('Admin only');
    return this.boardsService.create(dto);
  }
}
