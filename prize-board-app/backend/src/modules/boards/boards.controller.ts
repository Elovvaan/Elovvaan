import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, CreateCreatorBoardDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CreatorGuard } from '../../common/guards/creator.guard';

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

  @Post('creator')
  @UseGuards(JwtAuthGuard, CreatorGuard)
  createCreatorBoard(@Req() req: { user: { sub: string } }, @Body() dto: CreateCreatorBoardDto) {
    return this.boardsService.createCreatorBoard(req.user.sub, dto);
  }
}
