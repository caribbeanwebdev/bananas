/**
 * Parser for inventory.json files.
 */

import { type Result, ok, err } from '../lib/result.js';
import type { InventoryRecord } from '../lib/types.js';
import { logger } from '../lib/logger.js';

interface RawInventoryItem {
  item: string;
  quantity: number;
}

function isValidInventoryItem(obj: unknown): obj is RawInventoryItem {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record['item'] === 'string' &&
    typeof record['quantity'] === 'number' &&
    record['quantity'] >= 0
  );
}

export function parseInventoryFile(content: string): Result<readonly InventoryRecord[], Error> {
  try {
    const parsed: unknown = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      return err(new Error('Expected an array at root level'));
    }

    const records: InventoryRecord[] = [];

    for (const item of parsed) {
      if (!isValidInventoryItem(item)) {
        logger.warn('Invalid inventory item, skipping', { item });
        continue;
      }
      records.push({
        item: item.item.toLowerCase(),
        quantity: Math.floor(item.quantity)
      });
    }

    logger.debug('Parsed inventory file', { recordCount: records.length });
    return ok(records);
  } catch (error) {
    return err(new Error(`Failed to parse inventory file: ${error instanceof Error ? error.message : error}`));
  }
}

export function createInventoryMap(records: readonly InventoryRecord[]): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  for (const record of records) {
    map.set(record.item, record.quantity);
  }
  return map;
}
