/**
 * CLI argument parsing using commander.
 */

import { Command } from 'commander';
import type { LogLevel } from './logger.js';
import type { OutputFormat } from './types.js';

export interface CliArgs {
  readonly dataDir: string;
  readonly format: OutputFormat;
  readonly logLevel: LogLevel;
  readonly help: boolean;
}

const program = new Command()
  .name('zoo-food-audit')
  .description('Reconciles food deliveries, usage logs, and inventory counts to identify discrepancies')
  .option('-d, --data <dir>', 'Data directory containing input files', './data')
  .option('-f, --format <fmt>', 'Output format: text or json', 'text')
  .option('-l, --log-level <lvl>', 'Log level: debug, info, warn, error', 'info');

export function parseArgs(args: string[]): CliArgs {
  program.parse(args, { from: 'user' });
  const opts = program.opts();

  return {
    dataDir: opts['data'] as string,
    format: validateFormat(opts['format'] as string),
    logLevel: validateLogLevel(opts['logLevel'] as string),
    help: false
  };
}

function validateFormat(value: string): OutputFormat {
  if (value === 'json' || value === 'text') {
    return value;
  }
  return 'text';
}

function validateLogLevel(value: string): LogLevel {
  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
    return value;
  }
  return 'info';
}

export function printHelp(): void {
  program.outputHelp();
}
