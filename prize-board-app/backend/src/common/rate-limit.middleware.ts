import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from './redis.service';

interface RateLimitRule {
  key: string;
  limit: number;
  windowSeconds: number;
}

@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  constructor(private redis: RedisService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const routeRule = this.resolveRouteRule(req, ip);

    const allowed = await this.applyRule(routeRule);
    if (!allowed) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    const globalAllowed = await this.applyRule({ key: `rate:global:${ip}`, limit: 300, windowSeconds: 60 });
    if (!globalAllowed) {
      await this.redis.set(`block:${ip}`, '1', 300);
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    const blocked = await this.redis.get(`block:${ip}`);
    if (blocked) {
      throw new HttpException('IP blocked temporarily', HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }

  private resolveRouteRule(req: Request, ip: string): RateLimitRule {
    const path = req.path;

    if (path.startsWith('/auth/')) {
      return { key: `rate:auth:${ip}`, limit: 25, windowSeconds: 60 };
    }

    if (path.includes('/boards/') && path.endsWith('/enter')) {
      return { key: `rate:board-entry:${ip}`, limit: 20, windowSeconds: 60 };
    }

    if (path.startsWith('/payments/')) {
      return { key: `rate:payments:${ip}`, limit: 40, windowSeconds: 60 };
    }

    return { key: `rate:default:${ip}`, limit: 120, windowSeconds: 60 };
  }

  private async applyRule(rule: RateLimitRule) {
    const count = await this.redis.incrementBy(rule.key, 1, rule.windowSeconds);
    return count <= rule.limit;
  }
}
