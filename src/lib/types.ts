/**
 * Domain types for the Zoo Food Audit system.
 * All types are immutable (readonly) for thread safety.
 */

/**
 * Represents a quantity that may or may not have valid data.
 */
export type FoodQuantity =
  | { readonly status: 'valid'; readonly value: number }
  | { readonly status: 'missing'; readonly reason: string };

/**
 * A single food delivery record
 */
export interface DeliveryRecord {
  readonly item: string;
  readonly quantity: FoodQuantity;
}

/**
 * A single usage log entry
 */
export interface UsageRecord {
  readonly item: string;
  readonly quantity: number;
}

/**
 * A single inventory count
 */
export interface InventoryRecord {
  readonly item: string;
  readonly quantity: number;
}

/**
 * Result of reconciliation for a single food item
 */
export type ReconciliationResult =
  | { readonly status: 'ok'; readonly item: string; readonly expected: number; readonly actual: number }
  | { readonly status: 'discrepancy'; readonly item: string; readonly expected: number; readonly actual: number; readonly difference: number }
  | { readonly status: 'unknown'; readonly item: string; readonly reason: string };

/**
 * Summary statistics for the audit
 */
export interface AuditSummary {
  readonly totalItems: number;
  readonly okCount: number;
  readonly discrepancyCount: number;
  readonly unknownCount: number;
}

/**
 * Complete audit report
 */
export interface AuditReport {
  readonly timestamp: Date;
  readonly results: readonly ReconciliationResult[];
  readonly summary: AuditSummary;
}

/**
 * Output format options
 */
export type OutputFormat = 'text' | 'json';
