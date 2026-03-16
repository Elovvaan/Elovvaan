import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profiles: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.profiles.me(user.id);
  }
}
