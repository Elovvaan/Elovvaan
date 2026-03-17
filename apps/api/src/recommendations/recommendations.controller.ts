import { Body, Controller, Get, Logger, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LogBehaviorEventDto } from './dto/log-behavior-event.dto';
import { recommendationsBoardsResponseSchema, recommendationsChallengesResponseSchema, recommendationsHomeResponseSchema } from './recommendations.schemas';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  private readonly logger = new Logger(RecommendationsController.name);

  constructor(private recommendations: RecommendationsService) {}

  @Get('home')
  async home(@CurrentUser() user: { id: string }) {
    this.logger.debug(`Loading home recommendations for user=${user.id}`);
    const data = await this.recommendations.getHome(user.id);
    return recommendationsHomeResponseSchema.parse(data);
  }

  @Get('home/debug')
  async homeDebug(@CurrentUser() user: { id: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }

    this.logger.debug(`Loading debug home recommendations for user=${user.id}`);
    return this.recommendations.getHomeDebug(user.id);
  }

  @Post('debug/reset-derived-state')
  async resetDerivedState(@CurrentUser() user: { id: string }) {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }

    const result = await this.recommendations.resetDerivedRecommendationState(user.id);
    return { ok: true, ...result };
  }

  @Get('boards')
  async boards(@CurrentUser() user: { id: string }) {
    const data = await this.recommendations.recommendedBoards(user.id);
    return recommendationsBoardsResponseSchema.parse(data);
  }

  @Get('challenges')
  async challenges(@CurrentUser() user: { id: string }) {
    const data = await this.recommendations.recommendedChallenges(user.id);
    return recommendationsChallengesResponseSchema.parse(data);
  }

  @Post('events')
  async event(@CurrentUser() user: { id: string }, @Body() body: LogBehaviorEventDto) {
    const event = await this.recommendations.logBehaviorEvent(user.id, body);
    return {
      ok: true,
      event: {
        id: event.id,
        eventType: event.eventType,
        itemType: event.itemType,
        itemId: event.itemId,
        createdAt: event.createdAt,
      },
    };
  }
}
