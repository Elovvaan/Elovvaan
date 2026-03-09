import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Winner } from '../../database/entities/winner.entity';
import { WinnersService } from './winners.service';
import { WinnersController } from './winners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Winner])],
  providers: [WinnersService],
  controllers: [WinnersController],
  exports: [WinnersService]
})
export class WinnersModule {}
