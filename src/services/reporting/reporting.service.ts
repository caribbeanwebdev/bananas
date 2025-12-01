/**
 * Reporting service - formats audit reports for output.
 */

import type { AuditReport, ReconciliationResult, OutputFormat } from '../../lib/types.js';

function formatResultLine(result: ReconciliationResult): string {
  switch (result.status) {
    case 'ok':
      return `${result.item}: OK`;
    case 'discrepancy': {
      const sign = result.difference > 0 ? '+' : '';
      return `${result.item}: DISCREPANCY ${sign}${result.difference} (expected: ${result.expected}, actual: ${result.actual})`;
    }
    case 'unknown':
      return `${result.item}: UNKNOWN (${result.reason})`;
  }
}

export function generateTextReport(report: AuditReport): string {
  const lines: string[] = [];

  lines.push('Zoo Food Audit Report');
  lines.push('=====================');
  lines.push('');

  for (const result of report.results) {
    lines.push(formatResultLine(result));
  }

  lines.push('');

  const { summary } = report;
  const parts: string[] = [];

  if (summary.discrepancyCount > 0) {
    parts.push(`${summary.discrepancyCount} discrepanc${summary.discrepancyCount === 1 ? 'y' : 'ies'} found`);
  }

  if (summary.unknownCount > 0) {
    parts.push(`${summary.unknownCount} item${summary.unknownCount === 1 ? '' : 's'} with missing data`);
  }

  if (summary.discrepancyCount === 0 && summary.unknownCount === 0) {
    lines.push('Summary: All items OK! No discrepancies found.');
  } else {
    lines.push(`Summary: ${parts.join(', ')}`);
  }

  lines.push('');
  lines.push(`Report generated: ${report.timestamp.toISOString()}`);

  return lines.join('\n');
}

export function generateJsonReport(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

export function generateReport(report: AuditReport, format: OutputFormat): string {
  switch (format) {
    case 'text':
      return generateTextReport(report);
    case 'json':
      return generateJsonReport(report);
  }
}
