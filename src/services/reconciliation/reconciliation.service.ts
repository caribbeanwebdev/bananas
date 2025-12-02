/**
 * Reconciliation service - core business logic.
 */

import type { FoodQuantity, ReconciliationResult, AuditReport, AuditSummary } from '../../lib/types.js';
import { logger } from '../../lib/logger.js';

export function reconcileItem(
  item: string,
  delivered: FoodQuantity | undefined,
  used: number,
  actual: number | undefined
): ReconciliationResult {
  if (delivered === undefined || delivered.status === 'missing') {
    const reason = delivered?.status === 'missing' ? delivered.reason : 'no delivery record';
    return { status: 'unknown', item, reason };
  }

  if (actual === undefined) {
    return { status: 'unknown', item, reason: 'no inventory record' };
  }

  const expected = delivered.value - used;
  const difference = actual - expected;

  if (difference === 0) {
    return { status: 'ok', item, expected, actual };
  }

  logger.debug({ item, expected, actual, difference }, 'Discrepancy found');
  return { status: 'discrepancy', item, expected, actual, difference };
}

function collectAllItems(
  deliveryMap: ReadonlyMap<string, FoodQuantity>,
  usageMap: ReadonlyMap<string, number>,
  inventoryMap: ReadonlyMap<string, number>
): ReadonlySet<string> {
  const items = new Set<string>();
  for (const key of deliveryMap.keys()) items.add(key);
  for (const key of usageMap.keys()) items.add(key);
  for (const key of inventoryMap.keys()) items.add(key);
  return items;
}

export function reconcileAll(
  deliveryMap: ReadonlyMap<string, FoodQuantity>,
  usageMap: ReadonlyMap<string, number>,
  inventoryMap: ReadonlyMap<string, number>
): readonly ReconciliationResult[] {
  const allItems = collectAllItems(deliveryMap, usageMap, inventoryMap);
  const sortedItems = Array.from(allItems).sort();
  const results: ReconciliationResult[] = [];

  for (const item of sortedItems) {
    const delivered = deliveryMap.get(item);
    const used = usageMap.get(item) ?? 0;
    const actual = inventoryMap.get(item);

    results.push(reconcileItem(item, delivered, used, actual));
  }

  return results;
}

function calculateSummary(results: readonly ReconciliationResult[]): AuditSummary {
  let okCount = 0;
  let discrepancyCount = 0;
  let unknownCount = 0;

  for (const result of results) {
    switch (result.status) {
      case 'ok':
        okCount++;
        break;
      case 'discrepancy':
        discrepancyCount++;
        break;
      case 'unknown':
        unknownCount++;
        break;
    }
  }

  return { totalItems: results.length, okCount, discrepancyCount, unknownCount };
}

export function createAuditReport(
  deliveryMap: ReadonlyMap<string, FoodQuantity>,
  usageMap: ReadonlyMap<string, number>,
  inventoryMap: ReadonlyMap<string, number>
): AuditReport {
  const results = reconcileAll(deliveryMap, usageMap, inventoryMap);
  const summary = calculateSummary(results);

  logger.info({
    totalItems: summary.totalItems,
    discrepancies: summary.discrepancyCount,
    unknown: summary.unknownCount
  }, 'Audit report generated');

  return { timestamp: new Date(), results, summary };
}
