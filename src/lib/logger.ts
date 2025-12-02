/**
 * Logger using pino.
 */

import pino from 'pino';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isProduction = process.env['NODE_ENV'] === 'production';

export const logger = isProduction
  ? pino({ level: process.env['LOG_LEVEL'] ?? 'info' })
  : pino({
      level: process.env['LOG_LEVEL'] ?? 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    });

export function setLogLevel(level: LogLevel): void {
  logger.level = level;
}
