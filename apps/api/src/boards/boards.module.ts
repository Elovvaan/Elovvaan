import { Module } from '@nestjs/common';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';

@Module({ providers: [BoardsService], controllers: [BoardsController], exports: [BoardsService] })
export class BoardsModule {}
