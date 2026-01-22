/**
 * @fileoverview Test suite for index module utility functions.
 */

import { getKeys, getValues, getObject } from './index';
import { IAccount, Roles } from './account';
import { IProduct, ProductCategories, ProductTypes } from './product';
import { IStockEntry, StockEntryType } from './ledgers/stock';
import { LedgerType } from './ledgers/ledgers';
import { IRefill, RefillMethods, RefillStatus } from './ledgers/refill';
import { ITransaction, TransactionType } from './ledgers/transaction';

describe('Index Module Utilities', () => {
  describe('getKeys function', () => {
    it('should return keys for a simple object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const keys = getKeys(testAccount);
      expect(keys).toContain('id');
      expect(keys).toContain('username');
      expect(keys).toContain('balance');
    });

    it('should return empty array for empty object', () => {
      const keys = getKeys({} as Record<string, never>);
      expect(keys).toEqual([]);
    });

    it('should include product-specific metadata for order and stock products', () => {
      const orderProduct: IProduct<ProductTypes.Order> = {
        id: 'prod-order-1',
        category: ProductCategories.Food,
        name: 'Meal Plan',
        description: 'Monthly plan',
        price: 5000n,
        type: ProductTypes.Order,
        order: {
          supplier: 'Kitchen Co',
          minimum: 10n,
          current: 4n,
        },
      };

      const stockProduct: IProduct<ProductTypes.Stock> = {
        id: 'prod-stock-1',
        category: ProductCategories.Drinks,
        name: 'Soda Can',
        price: 200n,
        type: ProductTypes.Stock,
        stock: {
          amount: 150n,
          cost: 100n,
        },
      };

      const orderKeys = getKeys(orderProduct);
      const stockKeys = getKeys(stockProduct);

      expect(orderKeys).toContain('order');
      expect(stockKeys).toContain('stock');
    });

    it('should surface ledger metadata for stock entries and refills', () => {
      const stockEntry: IStockEntry<StockEntryType.Purchase> = {
        id: 'stock-entry-1',
        type: LedgerType.Stock,
        createdAt: new Date('2024-06-01T10:00:00.000Z'),
        updatedAt: new Date('2024-06-01T10:05:00.000Z'),
        entryType: StockEntryType.Purchase,
        productId: 'prod-xyz',
        delta: 25n,
        cost: 1250n,
        description: 'Weekly top-up',
      };

      const refill: IRefill = {
        id: 'refill-1',
        type: LedgerType.Refill,
        createdAt: new Date('2024-06-02T09:00:00.000Z'),
        updatedAt: new Date('2024-06-02T09:10:00.000Z'),
        account: 'acc-123',
        method: RefillMethods.Cash,
        reference: 'cash-001',
        amount: 2000n,
        cost: 2000n,
        status: RefillStatus.Complete,
        description: 'Cash top up',
      };

      expect(getKeys(stockEntry)).toEqual(
        expect.arrayContaining(['createdAt', 'entryType', 'delta', 'cost'])
      );
      expect(getKeys(refill)).toEqual(
        expect.arrayContaining(['method', 'status', 'createdAt'])
      );
    });
  });

  describe('getValues function', () => {
    it('should return values for an account object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456', 
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const values = getValues(testAccount);
      expect(values).toContain('123');
      expect(values).toContain('testuser');
      expect(values).toContain(true);
    });

    it('should return empty array for empty object', () => {
      const values = getValues({} as Record<string, never>);
      expect(values).toEqual([]);
    });

    it('should include order and stock specific product values', () => {
      const orderProduct: IProduct<ProductTypes.Order> = {
        id: 'prod-order-1',
        category: ProductCategories.Merch,
        name: 'Sticker Pack',
        price: 500n,
        type: ProductTypes.Order,
        order: {
          supplier: 'Print Shop',
          minimum: 50n,
          current: 20n,
        },
      };

      const stockProduct: IProduct<ProductTypes.Stock> = {
        id: 'prod-stock-1',
        category: ProductCategories.Other,
        name: 'Mug',
        price: 1500n,
        type: ProductTypes.Stock,
        stock: {
          amount: 75n,
          cost: 800n,
        },
      };

      const orderValues = getValues(orderProduct);
      const stockValues = getValues(stockProduct);

      expect(orderValues[orderValues.length - 1]).toEqual(orderProduct.order);
      expect(stockValues[stockValues.length - 1]).toBe(75n);
    });

    it('should include optional cost metadata for stock entries when present', () => {
      const purchaseEntry: IStockEntry<StockEntryType.Purchase> = {
        id: 'stock-entry-1',
        type: LedgerType.Stock,
        createdAt: new Date('2024-06-03T12:00:00.000Z'),
        updatedAt: new Date('2024-06-03T12:05:00.000Z'),
        entryType: StockEntryType.Purchase,
        productId: 'prod-abc',
        delta: 40n,
        cost: 2000n,
      };

      const saleEntry: IStockEntry<StockEntryType.Sale> = {
        id: 'stock-entry-2',
        type: LedgerType.Stock,
        createdAt: new Date('2024-06-03T13:00:00.000Z'),
        updatedAt: new Date('2024-06-03T13:05:00.000Z'),
        entryType: StockEntryType.Sale,
        productId: 'prod-def',
        delta: -5n,
      };

      const purchaseValues = getValues(purchaseEntry);
      const saleValues = getValues(saleEntry);

      expect(purchaseValues).toContain(2000n);
      expect(saleValues).not.toContain(2000n);
    });

    it('should provide transaction and refill values in definition order', () => {
      const transaction: ITransaction = {
        id: 'txn-100',
        type: LedgerType.Transaction,
        createdAt: new Date('2024-06-04T08:00:00.000Z'),
        updatedAt: new Date('2024-06-04T08:15:00.000Z'),
        accountId: 'acc-456',
        transactionType: TransactionType.Credit,
        products: [],
        total: 1500n,
      };

      const refill: IRefill = {
        id: 'refill-2',
        type: LedgerType.Refill,
        createdAt: new Date('2024-06-04T09:00:00.000Z'),
        updatedAt: new Date('2024-06-04T09:10:00.000Z'),
        account: 'acc-456',
        method: RefillMethods.Stripe,
        reference: 'stripe-001',
        amount: 1500n,
        cost: 1600n,
        status: RefillStatus.Pending,
      };

      expect(getValues(transaction)[0]).toBe('txn-100');
      expect(getValues(refill)).toEqual(
        expect.arrayContaining(['stripe-001', RefillStatus.Pending])
      );
    });
  });

  describe('getObject function', () => {
    it('should create key-value pairs from an account object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const objects = getObject(testAccount);
      expect(objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'id', value: '123' }),
          expect.objectContaining({ key: 'username', value: 'testuser' }),
          expect.objectContaining({ key: 'notify', value: true })
        ])
      );
    });

    it('should handle minimal object properly', () => {
      // Create a minimal account object
      const minimalAccount: IAccount = {
        id: '',
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        role: Roles.Unverified,
        balance: 0n,
        notify: false
      };
      
      const objects = getObject(minimalAccount);
      expect(objects).toHaveLength(9); // Should have 9 key-value pairs (including gid)
      expect(objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'id', value: '' }),
          expect.objectContaining({ key: 'username', value: '' }),
          expect.objectContaining({ key: 'balance', value: 0n }),
          expect.objectContaining({ key: 'notify', value: false })
        ])
      );
    });

    it('should align keys and values for stock entries with optional cost', () => {
      const entry: IStockEntry<StockEntryType.Purchase> = {
        id: 'stock-entry-3',
        type: LedgerType.Stock,
        createdAt: new Date('2024-06-05T11:00:00.000Z'),
        updatedAt: new Date('2024-06-05T11:05:00.000Z'),
        entryType: StockEntryType.Purchase,
        productId: 'prod-ghi',
        delta: 60n,
        cost: 3000n,
      };

      const objects = getObject(entry);
      expect(objects).toEqual(
        expect.arrayContaining([
          { key: 'entryType', value: StockEntryType.Purchase },
          { key: 'cost', value: 3000n },
        ])
      );
    });
  });

  describe('BigInt serialization', () => {
    it('should serialize BigInt values to strings', () => {
      const data = { amount: 1000n };
      const jsonString = JSON.stringify(data);
      expect(jsonString).toBe('{"amount":"1000"}');
    });

    it('should handle BigInt in complex objects', () => {
      const complexData = {
        name: 'test',
        balance: 2500n,
        active: true
      };
      const jsonString = JSON.stringify(complexData);
      expect(jsonString).toBe('{"name":"test","balance":"2500","active":true}');
    });
  });
});
