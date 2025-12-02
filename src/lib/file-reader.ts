/**
 * File reading utilities.
 */

import { readFile } from 'node:fs/promises';

export async function readDataFile(path: string, description: string): Promise<string> {
  try {
    return await readFile(path, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read ${description} (${path}): ${error instanceof Error ? error.message : error}`);
  }
}
