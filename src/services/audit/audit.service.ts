/**
 * Audit service - orchestrates the complete audit workflow.
 */

import { resolve } from 'node:path';

import { readDataFile } from '../../lib/file-reader.js';
import { logger } from '../../lib/logger.js';
import type { OutputFormat } from '../../lib/types.js';
import {
  parseDeliveryFile,
  createDeliveryMap,
  parseUsageFile,
  aggregateUsage,
  parseInventoryFile,
  createInventoryMap
} from '../../parsers/index.js';
import { createAuditReport } from '../reconciliation/index.js';
import { generateReport } from '../reporting/index.js';

export async function runAudit(dataDir: string, format: OutputFormat): Promise<string> {
  const resolvedDir = resolve(dataDir);
  const deliveryPath = resolve(resolvedDir, 'delivery.txt');
  const usagePath = resolve(resolvedDir, 'usage.csv');
  const inventoryPath = resolve(resolvedDir, 'inventory.json');

  logger.info({ dataDir: resolvedDir }, 'Starting audit');

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
  return generateReport(report, format);
}
