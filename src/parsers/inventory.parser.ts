/**
 * Parser for inventory.json files using zod validation.
 */

import { z } from 'zod';
import { type Result, ok, err } from '../lib/result.js';
import type { InventoryRecord } from '../lib/types.js';
import { logger } from '../lib/logger.js';

const InventoryItemSchema = z.object({
  item: z.string().min(1),
  quantity: z.number().nonnegative()
});

const InventoryFileSchema = z.array(InventoryItemSchema);

export function parseInventoryFile(content: string): Result<readonly InventoryRecord[], Error> {
  try {
    const parsed: unknown = JSON.parse(content);
    const validated = InventoryFileSchema.safeParse(parsed);

    if (!validated.success) {
      logger.warn({ errors: validated.error.issues }, 'Inventory validation failed');
      return err(new Error(`Invalid inventory format: ${validated.error.message}`));
    }

    const records: InventoryRecord[] = validated.data.map(item => ({
      item: item.item.toLowerCase(),
      quantity: Math.floor(item.quantity)
    }));

    logger.debug({ recordCount: records.length }, 'Parsed inventory file');
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
