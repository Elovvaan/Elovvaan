import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEntryDto } from './dto';

@Controller('boards/:id/enter')
export class EntriesController {
  constructor(private entriesService: EntriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  enter(@Param('id') boardId: string, @Req() req: { user: { sub: string } }, @Body() dto: CreateEntryDto) {
    return this.entriesService.enterBoard(boardId, req.user.sub, dto.paymentId);
  }
}
