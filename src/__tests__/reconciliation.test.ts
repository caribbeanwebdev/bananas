import { reconcileItem, reconcileAll, createAuditReport } from '../services/reconciliation/index.js';
import type { FoodQuantity } from '../lib/types.js';

describe('Reconciliation Service', () => {
  describe('reconcileItem', () => {
    it('should return OK when expected equals actual', () => {
      const delivered: FoodQuantity = { status: 'valid', value: 50 };

      const result = reconcileItem('banana', delivered, 25, 25);

      expect(result).toEqual({
        status: 'ok',
        item: 'banana',
        expected: 25,
        actual: 25
      });
    });

    it('should return DISCREPANCY when actual differs from expected', () => {
      const delivered: FoodQuantity = { status: 'valid', value: 50 };

      const result = reconcileItem('banana', delivered, 25, 18);

      expect(result).toEqual({
        status: 'discrepancy',
        item: 'banana',
        expected: 25,
        actual: 18,
        difference: -7
      });
    });

    it('should return UNKNOWN when delivery is missing', () => {
      const delivered: FoodQuantity = { status: 'missing', reason: 'empty value' };

      const result = reconcileItem('lettuce', delivered, 0, 10);

      expect(result).toEqual({
        status: 'unknown',
        item: 'lettuce',
        reason: 'empty value'
      });
    });

    it('should return UNKNOWN when delivery is undefined', () => {
      const result = reconcileItem('mystery', undefined, 0, 10);

      expect(result).toEqual({
        status: 'unknown',
        item: 'mystery',
        reason: 'no delivery record'
      });
    });

    it('should return UNKNOWN when inventory is undefined', () => {
      const delivered: FoodQuantity = { status: 'valid', value: 50 };

      const result = reconcileItem('banana', delivered, 25, undefined);

      expect(result).toEqual({
        status: 'unknown',
        item: 'banana',
        reason: 'no inventory record'
      });
    });
  });

  describe('reconcileAll', () => {
    it('should reconcile all items from all sources', () => {
      const deliveryMap = new Map<string, FoodQuantity>([
        ['banana', { status: 'valid', value: 50 }],
        ['fish', { status: 'valid', value: 100 }]
      ]);
      const usageMap = new Map([
        ['banana', 25],
        ['fish', 95]
      ]);
      const inventoryMap = new Map([
        ['banana', 25],
        ['fish', 5]
      ]);

      const results = reconcileAll(deliveryMap, usageMap, inventoryMap);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ status: 'ok', item: 'banana', expected: 25, actual: 25 });
      expect(results[1]).toEqual({ status: 'ok', item: 'fish', expected: 5, actual: 5 });
    });

    it('should return results sorted alphabetically', () => {
      const deliveryMap = new Map<string, FoodQuantity>([
        ['zebra', { status: 'valid', value: 10 }],
        ['apple', { status: 'valid', value: 20 }]
      ]);
      const usageMap = new Map<string, number>();
      const inventoryMap = new Map([
        ['zebra', 10],
        ['apple', 20]
      ]);

      const results = reconcileAll(deliveryMap, usageMap, inventoryMap);

      expect(results[0]?.item).toBe('apple');
      expect(results[1]?.item).toBe('zebra');
    });
  });

  describe('createAuditReport', () => {
    it('should create a complete report with summary', () => {
      const deliveryMap = new Map<string, FoodQuantity>([
        ['banana', { status: 'valid', value: 50 }],
        ['fish', { status: 'valid', value: 100 }],
        ['lettuce', { status: 'missing', reason: 'empty' }]
      ]);
      const usageMap = new Map([
        ['banana', 25],
        ['fish', 95]
      ]);
      const inventoryMap = new Map([
        ['banana', 18],
        ['fish', 5],
        ['lettuce', 0]
      ]);

      const report = createAuditReport(deliveryMap, usageMap, inventoryMap);

      expect(report.results).toHaveLength(3);
      expect(report.summary).toEqual({
        totalItems: 3,
        okCount: 1,
        discrepancyCount: 1,
        unknownCount: 1
      });
      expect(report.timestamp).toBeInstanceOf(Date);
    });
  });
});
