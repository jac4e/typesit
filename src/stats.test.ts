/**
 * @fileoverview Test suite for stats module types.
 */

import { 
  StatsDateRange,
  IFinanceStats,
  IInventoryStats,
  ITransactionStats,
  IAccountStats,
  IRefillStats,
  IStoreStats
} from './stats';
import { TransactionType } from './ledgers/transaction';
import { Roles } from './account';
import { RefillStatus } from './ledgers/refill';

describe('Stats Module', () => {
  describe('StatsDateRange enum', () => {
    it('should have correct date range values', () => {
      expect(StatsDateRange.All).toBe('all');
      expect(StatsDateRange.Day).toBe('1d');
      expect(StatsDateRange.Week).toBe('1w');
      expect(StatsDateRange.Month).toBe('1m');
      expect(StatsDateRange.Quarter).toBe('3m');
      expect(StatsDateRange.Year).toBe('1y');
    });

    it('should contain all expected date range options', () => {
      const ranges = Object.values(StatsDateRange);
      expect(ranges).toContain('all');
      expect(ranges).toContain('1d');
      expect(ranges).toContain('1w');
      expect(ranges).toContain('1m');
      expect(ranges).toContain('3m');
      expect(ranges).toContain('1y');
      expect(ranges).toHaveLength(6);
    });
  });

  describe('IFinanceStats interface', () => {
    it('should accept valid finance statistics', () => {
      const financeStats: IFinanceStats = {
        totalCredit: 50000,
        revenue: 12500,
        creditBalance: 37500,
        costOfGoodsSold: 8000,
        profit: 4500,
      };

      expect(financeStats.totalCredit).toBe(50000);
      expect(financeStats.revenue).toBe(12500);
      expect(financeStats.creditBalance).toBe(37500);
      expect(financeStats.costOfGoodsSold).toBe(8000);
      expect(financeStats.profit).toBe(4500);
    });

    it('should handle zero values', () => {
      const zeroStats: IFinanceStats = {
        totalCredit: 0,
        revenue: 0,
        creditBalance: 0,
        costOfGoodsSold: 0,
        profit: 0,
      };

      Object.values(zeroStats).forEach(value => {
        expect(value).toBe(0);
      });
    });

    it('should handle negative values', () => {
      const negativeStats: IFinanceStats = {
        totalCredit: 10000,
        revenue: 5000,
        creditBalance: 5000,
        costOfGoodsSold: 6000,
        profit: -1000, // Loss
      };

      expect(negativeStats.profit).toBe(-1000);
      expect(negativeStats.profit).toBeLessThan(0);
    });

    it('should handle large financial values', () => {
      const largeStats: IFinanceStats = {
        totalCredit: 1000000.50,
        revenue: 250000.75,
        creditBalance: 750000.25,
        costOfGoodsSold: 150000.00,
        profit: 100000.75,
      };

      expect(largeStats.totalCredit).toBeGreaterThan(1000000);
      expect(largeStats.revenue).toBeCloseTo(250000.75);
    });
  });

  describe('IInventoryStats interface', () => {
    it('should accept valid inventory statistics', () => {
      const inventoryStats: IInventoryStats = {
        total: 150,
        inStock: 120,
        outOfStock: 30,
        bookValue: 15000.50,
        retailValue: 22500.75,
      };

      expect(inventoryStats.total).toBe(150);
      expect(inventoryStats.inStock).toBe(120);
      expect(inventoryStats.outOfStock).toBe(30);
      expect(inventoryStats.bookValue).toBeCloseTo(15000.50);
      expect(inventoryStats.retailValue).toBeCloseTo(22500.75);
    });

    it('should maintain logical relationships', () => {
      const stats: IInventoryStats = {
        total: 100,
        inStock: 75,
        outOfStock: 25,
        bookValue: 5000,
        retailValue: 7500,
      };

      expect(stats.inStock + stats.outOfStock).toBe(stats.total);
      expect(stats.retailValue).toBeGreaterThan(stats.bookValue);
    });

    it('should handle edge cases', () => {
      const edgeCases: IInventoryStats[] = [
        // All items in stock
        { total: 50, inStock: 50, outOfStock: 0, bookValue: 1000, retailValue: 1500 },
        // All items out of stock
        { total: 50, inStock: 0, outOfStock: 50, bookValue: 0, retailValue: 0 },
        // No inventory
        { total: 0, inStock: 0, outOfStock: 0, bookValue: 0, retailValue: 0 },
      ];

      edgeCases.forEach(stats => {
        expect(stats.inStock + stats.outOfStock).toBe(stats.total);
        expect(stats.inStock).toBeGreaterThanOrEqual(0);
        expect(stats.outOfStock).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('ITransactionStats interface', () => {
    it('should include all transaction types', () => {
      const transactionStats: ITransactionStats = {
        [TransactionType.Debit]: 150,
        [TransactionType.Credit]: 75,
        total: 225,
      };

      expect(transactionStats[TransactionType.Debit]).toBe(150);
      expect(transactionStats[TransactionType.Credit]).toBe(75);
      expect(transactionStats.total).toBe(225);
    });

    it('should maintain total consistency', () => {
      const stats: ITransactionStats = {
        debit: 100,
        credit: 50,
        total: 150,
      };

      const calculatedTotal = stats.debit + stats.credit;
      expect(calculatedTotal).toBe(stats.total);
    });

    it('should handle zero transaction counts', () => {
      const zeroStats: ITransactionStats = {
        debit: 0,
        credit: 0,
        total: 0,
      };

      expect(zeroStats.total).toBe(0);
      expect(zeroStats.debit + zeroStats.credit).toBe(zeroStats.total);
    });
  });

  describe('IAccountStats interface', () => {
    it('should include all account roles', () => {
      const accountStats: IAccountStats = {
        [Roles.Unverified]: 25,
        [Roles.Member]: 150,
        [Roles.NonMember]: 30,
        [Roles.Admin]: 5,
        total: 210,
      };

      expect(accountStats[Roles.Unverified]).toBe(25);
      expect(accountStats[Roles.Member]).toBe(150);
      expect(accountStats[Roles.NonMember]).toBe(30);
      expect(accountStats[Roles.Admin]).toBe(5);
      expect(accountStats.total).toBe(210);
    });

    it('should maintain total consistency', () => {
      const stats: IAccountStats = {
        unverified: 10,
        member: 100,
        nonmember: 20,
        admin: 3,
        total: 133,
      };

      const calculatedTotal = stats.unverified + stats.member + stats.nonmember + stats.admin;
      expect(calculatedTotal).toBe(stats.total);
    });

    it('should handle realistic distribution', () => {
      const realisticStats: IAccountStats = {
        unverified: 50,  // New signups
        member: 800,     // Main user base
        nonmember: 100,  // Occasional users
        admin: 5,        // Small admin team
        total: 955,
      };

      expect(realisticStats.member).toBeGreaterThan(realisticStats.unverified);
      expect(realisticStats.member).toBeGreaterThan(realisticStats.nonmember);
      expect(realisticStats.admin).toBeLessThan(realisticStats.member);
    });
  });

  describe('IRefillStats interface', () => {
    it('should include all refill statuses', () => {
      const refillStats: IRefillStats = {
        [RefillStatus.Pending]: 15,
        [RefillStatus.Complete]: 85,
        [RefillStatus.Failed]: 8,
        [RefillStatus.Cancelled]: 12,
        total: 120,
      };

      expect(refillStats[RefillStatus.Pending]).toBe(15);
      expect(refillStats[RefillStatus.Complete]).toBe(85);
      expect(refillStats[RefillStatus.Failed]).toBe(8);
      expect(refillStats[RefillStatus.Cancelled]).toBe(12);
      expect(refillStats.total).toBe(120);
    });

    it('should maintain total consistency', () => {
      const stats: IRefillStats = {
        pending: 5,
        complete: 90,
        failed: 3,
        cancelled: 2,
        total: 100,
      };

      const calculatedTotal = stats.pending + stats.complete + stats.failed + stats.cancelled;
      expect(calculatedTotal).toBe(stats.total);
    });

    it('should reflect realistic refill patterns', () => {
      const realisticStats: IRefillStats = {
        pending: 5,      // Current processing
        complete: 150,   // Successfully processed
        failed: 8,       // Payment issues
        cancelled: 12,   // User cancelled
        total: 175,
      };

      expect(realisticStats.complete).toBeGreaterThan(realisticStats.pending);
      expect(realisticStats.complete).toBeGreaterThan(realisticStats.failed);
      expect(realisticStats.complete).toBeGreaterThan(realisticStats.cancelled);
    });
  });

  describe('IStoreStats interface', () => {
    it('should accept valid store statistics', () => {
      const storeStats: IStoreStats = {
        rankedProducts: [
          { name: 'Energy Drink', amountSold: 150, price: 2.50 },
          { name: 'Snack Bar', amountSold: 120, price: 1.75 },
          { name: 'Coffee', amountSold: 200, price: 3.00 },
        ],
        rankedBuyers: [
          { id: 'user_123', username: 'john_doe', amountSpent: 125.50 },
          { id: 'user_456', username: 'jane_smith', amountSpent: 98.75 },
          { id: 'user_789', username: 'bob_jones', amountSpent: 87.25 },
        ],
      };

      expect(storeStats.rankedProducts).toHaveLength(3);
      expect(storeStats.rankedBuyers).toHaveLength(3);
      expect(storeStats.rankedProducts[0].name).toBe('Energy Drink');
      expect(storeStats.rankedBuyers[0].username).toBe('john_doe');
    });

    it('should handle empty rankings', () => {
      const emptyStats: IStoreStats = {
        rankedProducts: [],
        rankedBuyers: [],
      };

      expect(emptyStats.rankedProducts).toHaveLength(0);
      expect(emptyStats.rankedBuyers).toHaveLength(0);
    });

    it('should handle single item rankings', () => {
      const singleItemStats: IStoreStats = {
        rankedProducts: [
          { name: 'Only Product', amountSold: 50, price: 5.00 },
        ],
        rankedBuyers: [
          { id: 'only_user', username: 'solo_buyer', amountSpent: 250.00 },
        ],
      };

      expect(singleItemStats.rankedProducts).toHaveLength(1);
      expect(singleItemStats.rankedBuyers).toHaveLength(1);
    });

    it('should maintain data integrity in rankings', () => {
      const stats: IStoreStats = {
        rankedProducts: [
          { name: 'Product A', amountSold: 100, price: 10.00 },
          { name: 'Product B', amountSold: 75, price: 15.00 },
          { name: 'Product C', amountSold: 50, price: 20.00 },
        ],
        rankedBuyers: [
          { id: 'user_1', username: 'buyer_1', amountSpent: 500.00 },
          { id: 'user_2', username: 'buyer_2', amountSpent: 300.00 },
          { id: 'user_3', username: 'buyer_3', amountSpent: 100.00 },
        ],
      };

      // Verify ranking order (should be descending by amount)
      expect(stats.rankedProducts[0].amountSold).toBeGreaterThanOrEqual(stats.rankedProducts[1].amountSold);
      expect(stats.rankedProducts[1].amountSold).toBeGreaterThanOrEqual(stats.rankedProducts[2].amountSold);
      
      expect(stats.rankedBuyers[0].amountSpent).toBeGreaterThanOrEqual(stats.rankedBuyers[1].amountSpent);
      expect(stats.rankedBuyers[1].amountSpent).toBeGreaterThanOrEqual(stats.rankedBuyers[2].amountSpent);
    });

    it('should handle products with zero sales', () => {
      const zeroSalesStats: IStoreStats = {
        rankedProducts: [
          { name: 'Popular Item', amountSold: 100, price: 5.00 },
          { name: 'Unpopular Item', amountSold: 0, price: 10.00 },
        ],
        rankedBuyers: [
          { id: 'active_user', username: 'big_spender', amountSpent: 500.00 },
          { id: 'inactive_user', username: 'window_shopper', amountSpent: 0.00 },
        ],
      };

      expect(zeroSalesStats.rankedProducts[1].amountSold).toBe(0);
      expect(zeroSalesStats.rankedBuyers[1].amountSpent).toBe(0);
    });
  });

  describe('Type relationships and consistency', () => {
    it('should work with object destructuring', () => {
      const financeStats: IFinanceStats = {
        totalCredit: 10000,
        revenue: 5000,
        creditBalance: 5000,
        costOfGoodsSold: 3000,
        profit: 2000,
      };

      const { totalCredit, revenue, profit } = financeStats;
      expect(totalCredit).toBe(10000);
      expect(revenue).toBe(5000);
      expect(profit).toBe(2000);
    });

    it('should work with object spreading', () => {
      const baseInventoryStats: IInventoryStats = {
        total: 100,
        inStock: 80,
        outOfStock: 20,
        bookValue: 5000,
        retailValue: 7500,
      };

      const extendedStats = {
        ...baseInventoryStats,
        lastUpdated: new Date(),
        category: 'electronics',
      };

      expect(extendedStats.total).toBe(100);
      expect(extendedStats.lastUpdated).toBeInstanceOf(Date);
      expect(extendedStats.category).toBe('electronics');
    });

    it('should maintain numerical precision', () => {
      const precisionStats: IFinanceStats = {
        totalCredit: 123.45,
        revenue: 67.89,
        creditBalance: 55.56,
        costOfGoodsSold: 34.21,
        profit: 33.68,
      };

      expect(precisionStats.totalCredit).toBeCloseTo(123.45, 2);
      expect(precisionStats.revenue).toBeCloseTo(67.89, 2);
      expect(precisionStats.profit).toBeCloseTo(33.68, 2);
    });
  });
});
