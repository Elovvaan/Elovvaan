import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { CreatorBoard } from '../../database/entities/creator-board.entity';
import { Payment } from '../../database/entities/payment.entity';
import { CreatorsService } from './creators.service';
import { CreatorsController } from './creators.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, CreatorBoard, Payment])],
  providers: [CreatorsService],
  controllers: [CreatorsController],
  exports: [CreatorsService]
})
export class CreatorsModule {}
