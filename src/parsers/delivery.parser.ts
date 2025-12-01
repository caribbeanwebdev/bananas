/**
 * Parser for delivery.txt files (properties format).
 */

import { type Result, ok, err } from '../lib/result.js';
import type { DeliveryRecord, FoodQuantity } from '../lib/types.js';
import { logger } from '../lib/logger.js';

function parsePropertyValue(rawValue: string): FoodQuantity {
  const trimmed = rawValue.trim();

  if (trimmed === '') {
    return { status: 'missing', reason: 'empty value in delivery file' };
  }

  const unquoted = trimmed.replace(/^["'](.*)["']$/, '$1');
  const parsed = Number(unquoted);

  if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return { status: 'missing', reason: `invalid quantity: "${rawValue}"` };
  }

  return { status: 'valid', value: parsed };
}

export function parseDeliveryFile(content: string): Result<readonly DeliveryRecord[], Error> {
  try {
    const lines = content.split(/\r?\n/);
    const records: DeliveryRecord[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) continue;

      const equalsIndex = trimmed.indexOf('=');
      if (equalsIndex === -1) {
        logger.warn('Line without equals sign, skipping', { line: trimmed });
        continue;
      }

      const itemName = trimmed.substring(0, equalsIndex).trim().toLowerCase();
      const rawValue = trimmed.substring(equalsIndex + 1);

      if (itemName === '') continue;

      records.push({
        item: itemName,
        quantity: parsePropertyValue(rawValue)
      });
    }

    logger.debug('Parsed delivery file', { recordCount: records.length });
    return ok(records);
  } catch (error) {
    return err(new Error(`Failed to parse delivery file: ${error instanceof Error ? error.message : error}`));
  }
}

export function createDeliveryMap(records: readonly DeliveryRecord[]): ReadonlyMap<string, FoodQuantity> {
  const map = new Map<string, FoodQuantity>();
  for (const record of records) {
    map.set(record.item, record.quantity);
  }
  return map;
}
