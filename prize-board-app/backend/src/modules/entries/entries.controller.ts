import { Body, Controller, Param, Post } from '@nestjs/common';
import { EntriesService } from './entries.service';

@Controller('boards/:id/enter')
export class EntriesController {
  constructor(private entriesService: EntriesService) {}

  @Post()
  enter(@Param('id') boardId: string, @Body() body: { userId: string; paymentId: string }) {
    return this.entriesService.enterBoard(boardId, body.userId, body.paymentId);
  }
}
