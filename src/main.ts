/**
 * Zoo Food Audit Tool - Main entry point
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { setLogLevel, logger, type LogLevel } from './lib/logger.js';
import type { OutputFormat } from './lib/types.js';
import {
  parseDeliveryFile,
  createDeliveryMap,
  parseUsageFile,
  aggregateUsage,
  parseInventoryFile,
  createInventoryMap
} from './parsers/index.js';
import { createAuditReport } from './services/reconciliation/index.js';
import { generateReport } from './services/reporting/index.js';

interface CliArgs {
  dataDir: string;
  format: OutputFormat;
  logLevel: LogLevel;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {
    dataDir: './data',
    format: 'text',
    logLevel: 'info',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--format' || arg === '-f') {
      const format = args[i + 1];
      if (format === 'json' || format === 'text') {
        result.format = format;
        i++;
      }
    } else if (arg === '--data' || arg === '-d') {
      const dir = args[i + 1];
      if (dir) {
        result.dataDir = dir;
        i++;
      }
    } else if (arg === '--log-level' || arg === '-l') {
      const level = args[i + 1];
      if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
        result.logLevel = level;
        i++;
      }
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
Zoo Food Audit Tool
===================

Reconciles food deliveries, usage logs, and inventory counts to identify discrepancies.

Usage:
  npm run audit [options]
  node dist/main.js [options]

Options:
  -d, --data <dir>       Data directory containing input files (default: ./data)
  -f, --format <fmt>     Output format: text or json (default: text)
  -l, --log-level <lvl>  Log level: debug, info, warn, error (default: info)
  -h, --help             Show this help message

Input Files (expected in data directory):
  delivery.txt    - Properties format file of food deliveries
  usage.csv       - CSV file of food usage logs
  inventory.json  - JSON file of current inventory counts

Example:
  npm run audit -- --data ./data --format text
`);
}

async function readDataFile(path: string, description: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read ${description} (${path}): ${error instanceof Error ? error.message : error}`);
  }
}

async function runAudit(dataDir: string, format: OutputFormat): Promise<void> {
  const resolvedDir = resolve(dataDir);
  const deliveryPath = resolve(resolvedDir, 'delivery.txt');
  const usagePath = resolve(resolvedDir, 'usage.csv');
  const inventoryPath = resolve(resolvedDir, 'inventory.json');

  logger.info('Starting audit', { dataDir: resolvedDir });

  // Read all files in parallel
  const [deliveryContent, usageContent, inventoryContent] = await Promise.all([
    readDataFile(deliveryPath, 'delivery file'),
    readDataFile(usagePath, 'usage file'),
    readDataFile(inventoryPath, 'inventory file')
  ]);

  // Parse files
  const deliveryResult = parseDeliveryFile(deliveryContent);
  if (!deliveryResult.ok) throw deliveryResult.error;

  const usageResult = parseUsageFile(usageContent);
  if (!usageResult.ok) throw usageResult.error;

  const inventoryResult = parseInventoryFile(inventoryContent);
  if (!inventoryResult.ok) throw inventoryResult.error;

  // Create lookup maps
  const deliveryMap = createDeliveryMap(deliveryResult.value);
  const usageMap = aggregateUsage(usageResult.value);
  const inventoryMap = createInventoryMap(inventoryResult.value);

  // Generate report
  const report = createAuditReport(deliveryMap, usageMap, inventoryMap);
  const output = generateReport(report, format);

  console.log(output);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  setLogLevel(args.logLevel);

  try {
    await runAudit(args.dataDir, args.format);
  } catch (error) {
    logger.error('Audit failed', { error: error instanceof Error ? error.message : error });
    process.exit(1);
  }
}

main();
