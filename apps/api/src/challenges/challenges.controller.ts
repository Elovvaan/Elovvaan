import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { RecordResultDto } from './dto/record-result.dto';

@Controller('challenges')
export class ChallengesController {
  constructor(private challenges: ChallengesService) {}

  @Get()
  list() {
    return this.challenges.list();
  }

  @Get(':id')
  details(@Param('id') id: string) {
    return this.challenges.details(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateChallengeDto) {
    return this.challenges.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/accept')
  accept(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.challenges.accept(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/result')
  recordResult(@Param('id') id: string, @Body() dto: RecordResultDto) {
    return this.challenges.recordResult(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/history')
  history(@CurrentUser() user: { id: string }) {
    return this.challenges.history(user.id);
  }
}
