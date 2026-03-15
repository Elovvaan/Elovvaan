import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WinnersService } from './winners.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('boards/:id/winner')
export class WinnersController {
  constructor(private winnersService: WinnersService) {}

  @Get()
  get(@Param('id') id: string) {
    return this.winnersService.findByBoard(id);
  }

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  claim(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    return this.winnersService.claimWinner(id, req.user.sub);
  }
}
