import { Controller, Get, Param } from '@nestjs/common';
import { WinnersService } from './winners.service';

@Controller('boards/:id/winner')
export class WinnersController {
  constructor(private winnersService: WinnersService) {}

  @Get()
  get(@Param('id') id: string) {
    return this.winnersService.findByBoard(id);
  }
}
