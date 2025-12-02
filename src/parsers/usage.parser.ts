/**
 * Parser for usage.csv files using csv-parse library.
 */

import { parse } from 'csv-parse/sync';
import { type Result, ok, err } from '../lib/result.js';
import type { UsageRecord } from '../lib/types.js';
import { logger } from '../lib/logger.js';

interface CsvRow {
  food: string;
  quantity: string;
}

export function parseUsageFile(content: string): Result<readonly UsageRecord[], Error> {
  try {
    if (content.trim() === '') return ok([]);

    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CsvRow[];

    const records: UsageRecord[] = [];

    for (const row of rows) {
      const item = row.food?.toLowerCase();
      const quantity = Number(row.quantity);

      if (!item || Number.isNaN(quantity) || quantity < 0) {
        logger.warn({ row }, 'Invalid usage row, skipping');
        continue;
      }

      records.push({ item, quantity: Math.floor(quantity) });
    }

    logger.debug({ recordCount: records.length }, 'Parsed usage file');
    return ok(records);
  } catch (error) {
    return err(new Error(`Failed to parse usage file: ${error instanceof Error ? error.message : error}`));
  }
}

export function aggregateUsage(records: readonly UsageRecord[]): ReadonlyMap<string, number> {
  const totals = new Map<string, number>();
  for (const record of records) {
    const current = totals.get(record.item) ?? 0;
    totals.set(record.item, current + record.quantity);
  }
  return totals;
}
