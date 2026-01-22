/**
 * @fileoverview Test suite for common types and utilities.
 */

import { ICoin, IQuantity, HTTP } from './common';
import { IAccount, Roles } from './account';

describe('Common Types', () => {
  describe('ICoin type', () => {
    it('should accept BigInt values', () => {
      const coin: ICoin = 100n;
      expect(typeof coin).toBe('bigint');
      expect(coin).toBe(100n);
    });

    it('should handle zero values', () => {
      const coin: ICoin = 0n;
      expect(coin).toBe(0n);
    });

    it('should handle negative values', () => {
      const coin: ICoin = -50n;
      expect(coin).toBe(-50n);
    });

    it('should handle large values', () => {
      const coin: ICoin = BigInt(Number.MAX_SAFE_INTEGER) * 2n;
      expect(typeof coin).toBe('bigint');
    });
  });

  describe('IQuantity type', () => {
    it('should accept BigInt values', () => {
      const quantity: IQuantity = 25n;
      expect(typeof quantity).toBe('bigint');
      expect(quantity).toBe(25n);
    });

    it('should handle zero quantity', () => {
      const quantity: IQuantity = 0n;
      expect(quantity).toBe(0n);
    });

    it('should handle large quantities', () => {
      const quantity: IQuantity = 999999999999n;
      expect(typeof quantity).toBe('bigint');
    });
  });

  describe('HTTP type transformation', () => {
    it('should transform bigint to string in simple objects', () => {
      interface TestObject {
        id: string;
        amount: bigint;
        count: number;
      }

      // This is a compile-time test - if it compiles, the type works correctly
      const httpObject: HTTP<TestObject> = {
        id: 'test',
        amount: '100', // bigint becomes string
        count: 5, // number remains number
      };

      expect(httpObject.id).toBe('test');
      expect(httpObject.amount).toBe('100');
      expect(httpObject.count).toBe(5);
      expect(typeof httpObject.amount).toBe('string');
    });

    it('should transform Date to string', () => {
      interface TestObject {
        id: string;
        createdAt: Date;
        amount: bigint;
      }

      const httpObject: HTTP<TestObject> = {
        id: 'test',
        createdAt: '2023-01-01T00:00:00.000Z', // Date becomes string
        amount: '100', // bigint becomes string
      };

      expect(typeof httpObject.createdAt).toBe('string');
      expect(typeof httpObject.amount).toBe('string');
    });

    it('should handle optional bigint properties', () => {
      interface TestObject {
        id: string;
        optionalAmount?: bigint;
      }

      const httpObject1: HTTP<TestObject> = {
        id: 'test',
        optionalAmount: '100', // optional bigint becomes optional string
      };

      const httpObject2: HTTP<TestObject> = {
        id: 'test',
        optionalAmount: undefined, // can still be undefined
      };

      expect(httpObject1.optionalAmount).toBe('100');
      expect(httpObject2.optionalAmount).toBeUndefined();
    });

    it('should work with IAccount transformation', () => {
      const httpAccount: HTTP<IAccount> = {
        id: 'acc_123',
        gid: 'google_456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: '1000', // ICoin (bigint) becomes string
        notify: true,
      };

      expect(typeof httpAccount.balance).toBe('string');
      expect(httpAccount.balance).toBe('1000');
      expect(httpAccount.role).toBe(Roles.Member);
    });
  });

  describe('Type compatibility', () => {
    it('should maintain ICoin and IQuantity interoperability', () => {
      const coin: ICoin = 100n;
      const quantity: IQuantity = coin; // Should be assignable
      expect(quantity).toBe(coin);
    });

    it('should work with BigInt operations', () => {
      const coin1: ICoin = 100n;
      const coin2: ICoin = 50n;
      const sum: ICoin = coin1 + coin2;
      expect(sum).toBe(150n);
    });

    it('should work with comparison operations', () => {
      const coin1: ICoin = 100n;
      const coin2: ICoin = 50n;
      expect(coin1 > coin2).toBe(true);
      expect(coin1 < coin2).toBe(false);
      expect(coin1 === 100n).toBe(true);
    });
  });
});
