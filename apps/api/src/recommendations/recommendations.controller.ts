import { Controller, Get, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private recommendations: RecommendationsService) {}

  @Get('home')
  home(@CurrentUser() user: { id: string }) {
    return this.recommendations.getHome(user.id);
  }

  @Get('boards')
  boards(@CurrentUser() user: { id: string }) {
    return this.recommendations.recommendedBoards(user.id);
  }

  @Get('challenges')
  challenges(@CurrentUser() user: { id: string }) {
    return this.recommendations.recommendedChallenges(user.id);
  }
}
