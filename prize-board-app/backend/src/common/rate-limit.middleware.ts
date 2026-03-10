import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from './redis.service';

@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  constructor(private redis: RedisService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate:${ip}`;
    const count = await this.redis.incrementBy(key, 1, 60);

    if (count > 300) {
      await this.redis.set(`block:${ip}`, '1', 300);
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    const blocked = await this.redis.get(`block:${ip}`);
    if (blocked) {
      throw new HttpException('IP blocked temporarily', HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
