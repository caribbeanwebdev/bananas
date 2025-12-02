/**
 * Parser for delivery.txt files (properties format) using dotenv.
 */

import { parse as dotenvParse } from 'dotenv';
import { type Result, ok, err } from '../lib/result.js';
import type { DeliveryRecord, FoodQuantity } from '../lib/types.js';
import { logger } from '../lib/logger.js';

function parsePropertyValue(rawValue: string | undefined): FoodQuantity {
  if (rawValue === undefined || rawValue.trim() === '') {
    return { status: 'missing', reason: 'empty value in delivery file' };
  }

  const trimmed = rawValue.trim();
  const unquoted = trimmed.replace(/^["'](.*)["']$/, '$1');
  const parsed = Number(unquoted);

  if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
    return { status: 'missing', reason: `invalid quantity: "${rawValue}"` };
  }

  return { status: 'valid', value: parsed };
}

export function parseDeliveryFile(content: string): Result<readonly DeliveryRecord[], Error> {
  try {
    const parsed = dotenvParse(Buffer.from(content));
    const records: DeliveryRecord[] = [];

    for (const [key, value] of Object.entries(parsed)) {
      const itemName = key.trim().toLowerCase();
      if (itemName === '') continue;

      records.push({
        item: itemName,
        quantity: parsePropertyValue(value)
      });
    }

    logger.debug({ recordCount: records.length }, 'Parsed delivery file');
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
