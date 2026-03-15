import { Logger } from '@nestjs/common';

const logger = new Logger('Observability');

export function logEvent(event: string, payload: Record<string, unknown> = {}) {
  logger.log(JSON.stringify({ event, timestamp: new Date().toISOString(), ...payload }));
}

export function logError(event: string, error: unknown, payload: Record<string, unknown> = {}) {
  const err = error as Error;
  logger.error(
    JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      sentryReady: Boolean(process.env.SENTRY_DSN),
      ...payload
    })
  );

  const sentry = (globalThis as { Sentry?: { captureException: (e: unknown) => void } }).Sentry;
  if (sentry?.captureException) {
    sentry.captureException(error);
  }
}
