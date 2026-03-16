import { Controller, Get, Query } from '@nestjs/common';
import { ArenaService } from './arena.service';

@Controller('arena')
export class ArenaController {
  constructor(private arena: ArenaService) {}

  @Get('feed')
  feed(@Query('userId') userId?: string) {
    return this.arena.feed(userId);
  }
}
