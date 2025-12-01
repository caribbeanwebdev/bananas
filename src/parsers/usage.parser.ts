/**
 * Parser for usage.csv files.
 */

import { type Result, ok, err } from '../lib/result.js';
import type { UsageRecord } from '../lib/types.js';
import { logger } from '../lib/logger.js';

export function parseUsageFile(content: string): Result<readonly UsageRecord[], Error> {
  try {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return ok([]);

    const dataLines = lines.slice(1); // Skip header
    const records: UsageRecord[] = [];

    for (const line of dataLines) {
      const fields = line.split(',').map(f => f.trim());
      const item = fields[0]?.toLowerCase();
      const quantity = Number(fields[1]);

      if (!item || Number.isNaN(quantity) || quantity < 0) continue;

      records.push({ item, quantity: Math.floor(quantity) });
    }

    logger.debug('Parsed usage file', { recordCount: records.length });
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
