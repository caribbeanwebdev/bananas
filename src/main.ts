/**
 * Zoo Food Audit Tool - CLI entry point
 */

import { parseArgs, printHelp } from './lib/cli.js';
import { setLogLevel, logger } from './lib/logger.js';
import { runAudit } from './services/audit/index.js';

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  setLogLevel(args.logLevel);

  try {
    const output = await runAudit(args.dataDir, args.format);
    console.log(output);
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : error }, 'Audit failed');
    process.exit(1);
  }
}

main();
