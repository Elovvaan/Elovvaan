import { Controller, Get, Param, Query } from '@nestjs/common';
import { CreatorsService } from './creators.service';

@Controller('creators')
export class CreatorsController {
  constructor(private creatorsService: CreatorsService) {}

  @Get('leaderboard')
  leaderboard(@Query('limit') limit?: string) {
    return this.creatorsService.leaderboard(limit ? Number(limit) : 50);
  }

  @Get(':id')
  getCreator(@Param('id') id: string) {
    return this.creatorsService.getProfile(id);
  }

  @Get(':id/boards')
  getCreatorBoards(@Param('id') id: string) {
    return this.creatorsService.getBoards(id);
  }
}
