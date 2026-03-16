import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('boards')
  createBoard(@Body() dto: CreateBoardDto) {
    return this.adminService.createBoard(dto);
  }

  @Get('boards')
  listBoards() {
    return this.adminService.listBoards();
  }

  @Patch('boards/:id')
  updateBoard(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.adminService.updateBoard(id, dto);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('boards/:id/entries')
  listEntries(@Param('id') id: string) {
    return this.adminService.listEntriesByBoard(id);
  }
}
