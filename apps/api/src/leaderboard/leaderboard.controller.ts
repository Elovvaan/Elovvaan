import { Controller, Get } from '@nestjs/common';

@Controller('leaderboard')
export class LeaderboardController {
  @Get()
  list() {
    return { message: 'Leaderboard placeholder ready for ranking pipelines' };
  }
}
