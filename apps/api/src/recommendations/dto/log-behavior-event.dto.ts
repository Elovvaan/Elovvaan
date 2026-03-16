import { BehaviorEventType } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class LogBehaviorEventDto {
  @IsEnum(BehaviorEventType)
  eventType!: BehaviorEventType;

  @IsString()
  @MaxLength(32)
  itemType!: string;

  @IsString()
  @MaxLength(128)
  itemId!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

