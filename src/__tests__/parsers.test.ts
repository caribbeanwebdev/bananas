import {
  parseDeliveryFile,
  createDeliveryMap,
  parseUsageFile,
  aggregateUsage,
  parseInventoryFile,
  createInventoryMap
} from '../parsers/index.js';

describe('Delivery Parser', () => {
  describe('parseDeliveryFile', () => {
    it('should parse valid delivery file', () => {
      const content = `banana=50
fish=100
hay=200`;

      const result = parseDeliveryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0]).toEqual({
          item: 'banana',
          quantity: { status: 'valid', value: 50 }
        });
      }
    });

    it('should handle empty values as missing', () => {
      const content = `lettuce=`;

      const result = parseDeliveryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]).toEqual({
          item: 'lettuce',
          quantity: { status: 'missing', reason: 'empty value in delivery file' }
        });
      }
    });

    it('should handle quoted values', () => {
      const content = `carrots="20"`;

      const result = parseDeliveryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]).toEqual({
          item: 'carrots',
          quantity: { status: 'valid', value: 20 }
        });
      }
    });

    it('should skip empty lines and comments', () => {
      const content = `# Comment
banana=50

fish=100`;

      const result = parseDeliveryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
      }
    });

    it('should normalize item names to lowercase', () => {
      const content = `BANANA=50`;

      const result = parseDeliveryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]?.item).toBe('banana');
      }
    });
  });

  describe('createDeliveryMap', () => {
    it('should create a map from records', () => {
      const records = [
        { item: 'banana', quantity: { status: 'valid' as const, value: 50 } },
        { item: 'fish', quantity: { status: 'valid' as const, value: 100 } }
      ];

      const map = createDeliveryMap(records);

      expect(map.get('banana')).toEqual({ status: 'valid', value: 50 });
      expect(map.get('fish')).toEqual({ status: 'valid', value: 100 });
    });
  });
});

describe('Usage Parser', () => {
  describe('parseUsageFile', () => {
    it('should parse valid usage CSV', () => {
      const content = `food,quantity
banana,8
fish,25
banana,12`;

      const result = parseUsageFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(3);
        expect(result.value[0]).toEqual({ item: 'banana', quantity: 8 });
      }
    });

    it('should handle empty file', () => {
      const result = parseUsageFile('');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe('aggregateUsage', () => {
    it('should sum quantities by item', () => {
      const records = [
        { item: 'banana', quantity: 8 },
        { item: 'fish', quantity: 25 },
        { item: 'banana', quantity: 12 }
      ];

      const map = aggregateUsage(records);

      expect(map.get('banana')).toBe(20);
      expect(map.get('fish')).toBe(25);
    });
  });
});

describe('Inventory Parser', () => {
  describe('parseInventoryFile', () => {
    it('should parse valid inventory JSON', () => {
      const content = JSON.stringify([
        { item: 'banana', quantity: 18 },
        { item: 'fish', quantity: 5 }
      ]);

      const result = parseInventoryFile(content);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toEqual({ item: 'banana', quantity: 18 });
      }
    });

    it('should handle empty array', () => {
      const result = parseInventoryFile('[]');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(0);
      }
    });

    it('should reject invalid JSON', () => {
      const result = parseInventoryFile('not valid json');

      expect(result.ok).toBe(false);
    });
  });

  describe('createInventoryMap', () => {
    it('should create a map from records', () => {
      const records = [
        { item: 'banana', quantity: 18 },
        { item: 'fish', quantity: 5 }
      ];

      const map = createInventoryMap(records);

      expect(map.get('banana')).toBe(18);
      expect(map.get('fish')).toBe(5);
    });
  });
});
