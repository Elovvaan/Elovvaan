import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../../database/entities/board.entity';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { User } from '../../database/entities/user.entity';
import { BoardsController } from './boards.controller';
import { BoardActivity } from '../../database/entities/board-activity.entity';
import { BoardsService } from './boards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Board, CreatorBoard, User, BoardActivity])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService]
})
export class BoardsModule {}
