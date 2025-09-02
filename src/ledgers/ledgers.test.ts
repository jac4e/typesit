/**
 * @fileoverview Comprehensive test suite for ledgers module.
 * Tests all union types, type guards, and edge cases.
 */

import {
  ILedger,
  ILedgerForm,
  ILedgerDocument,
  isILedger,
  isILedgerForm,
  isILedgerDocument
} from './ledgers';

// Import individual types for test data creation
import { IRefill, IRefillForm, IRefillDocument, RefillMethods, RefillStatus } from './refill';
import { IPreOrder, IPreOrderForm, IPreOrderDocument, PreOrderStatus } from './preorders';
import { IStockEntry, IStockEntryForm, IStockEntryDocument, StockEntryType } from './stock';
import { ITransaction, ITransactionForm, ITransactionDocument, TransactionType } from './transaction';
import { ProductCategories, ProductTypes } from '../product';

describe('Ledgers Module', () => {
  // Test data constants
  const VALID_REFILL: IRefill = {
    id: 'refill_123',
    account: 'acc_456',
    method: RefillMethods.Cash,
    reference: 'cash_001',
    amount: 1000n,
    cost: 1000n,
    dateCreated: new Date('2023-01-01T10:00:00.000Z'),
    dateUpdated: new Date('2023-01-01T10:00:00.000Z'),
    status: RefillStatus.Complete
  };

  const VALID_PREORDER: IPreOrder = {
    id: 'preorder_123',
    productId: 'prod_456',
    accountId: 'acc_789',
    amount: 5n,
    date: new Date('2023-01-01T11:00:00.000Z'),
    lastUpdated: new Date('2023-01-01T11:00:00.000Z'),
    status: PreOrderStatus.Ordered
  };

  const VALID_STOCK_ENTRY: IStockEntry = {
    id: 'stock_123',
    productId: 'prod_456',
    type: StockEntryType.Purchase,
    delta: 100n,
    cost: 5000n,
    date: new Date('2023-01-01T12:00:00.000Z'),
    notes: 'Initial stock purchase'
  };

  const VALID_TRANSACTION: ITransaction = {
    id: 'trans_123',
    accountId: 'acc_456',
    type: TransactionType.Debit,
    reason: 'Product purchase',
    products: [{
      name: 'Test Product',
      price: '10.00',
      amount: '2',
      total: '20.00'
    }],
    total: 2000n,
    date: new Date('2023-01-01T13:00:00.000Z')
  };

  // Form data - using the actual form interface types
  const VALID_REFILL_FORM: IRefillForm = {
    account: 'acc_456',
    method: RefillMethods.CreditCard,
    amount: 1000n // bigint, not string
  };

  const VALID_PREORDER_FORM: IPreOrderForm = {
    productId: 'prod_456',
    accountId: 'acc_789',
    amount: 3n, // bigint, not string
    status: PreOrderStatus.Ordered
  };

  const VALID_STOCK_ENTRY_FORM: IStockEntryForm = {
    productId: 'prod_456',
    type: StockEntryType.Sale,
    delta: 10n, // bigint, not string
    cost: 10000n, // bigint, not string
    notes: 'Product sale'
  };

  const VALID_TRANSACTION_FORM: ITransactionForm = {
    accountId: 'acc_456',
    type: TransactionType.Credit,
    reason: 'Refund',
    products: [{
      name: 'Refunded Product',
      price: '15.00',
      amount: '1',
      total: '15.00'
    }],
    total: '15.00'
  };

  describe('ILedger Type and isILedger Type Guard', () => {
    it('should validate refill entries', () => {
      expect(isILedger(VALID_REFILL)).toBe(true);
    });

    it('should validate preorder entries', () => {
      expect(isILedger(VALID_PREORDER)).toBe(true);
    });

    it('should validate stock entries', () => {
      expect(isILedger(VALID_STOCK_ENTRY)).toBe(true);
    });

    it('should validate transaction entries', () => {
      expect(isILedger(VALID_TRANSACTION)).toBe(true);
    });

    it('should reject invalid objects', () => {
      expect(isILedger({})).toBe(false);
      expect(isILedger(null)).toBe(false);
      expect(isILedger(undefined)).toBe(false);
      expect(isILedger('string')).toBe(false);
      expect(isILedger(123)).toBe(false);
      expect(isILedger([])).toBe(false);
    });

    it('should reject objects with missing required fields', () => {
      const incompleteRefill = {
        id: 'refill_123',
        account: 'acc_456'
        // Missing other required fields
      };
      expect(isILedger(incompleteRefill)).toBe(false);

      const incompleteTransaction = {
        id: 'trans_123',
        accountId: 'acc_456'
        // Missing other required fields
      };
      expect(isILedger(incompleteTransaction)).toBe(false);
    });

    it('should reject objects with invalid field types', () => {
      const invalidRefill = {
        ...VALID_REFILL,
        amount: 'invalid_bigint', // Should be bigint
      };
      expect(isILedger(invalidRefill)).toBe(false);

      // Note: ITransaction actually accepts Date | string for date field
      // so this test is adjusted to test a truly invalid field
      const invalidTransaction = {
        ...VALID_TRANSACTION,
        total: 'invalid_bigint', // Should be bigint
      };
      expect(isILedger(invalidTransaction)).toBe(false);
    });

    it('should handle edge case values', () => {
      const refillWithMinimalData: IRefill = {
        id: '',
        account: '',
        method: RefillMethods.Cash,
        reference: '',
        amount: 0n,
        cost: 0n,
        dateCreated: new Date(),
        dateUpdated: new Date(),
        status: RefillStatus.Pending
      };
      expect(isILedger(refillWithMinimalData)).toBe(true);

      const transactionWithEmptyProducts: ITransaction = {
        id: 'trans_empty',
        accountId: 'acc_123',
        type: TransactionType.Credit,
        reason: 'Empty transaction',
        products: [], // Empty array should be valid
        total: 0n,
        date: new Date()
      };
      expect(isILedger(transactionWithEmptyProducts)).toBe(true);
    });
  });

  describe('ILedgerForm Type and isILedgerForm Type Guard', () => {
    it('should validate refill form data', () => {
      expect(isILedgerForm(VALID_REFILL_FORM)).toBe(true);
    });

    it('should validate preorder form data', () => {
      expect(isILedgerForm(VALID_PREORDER_FORM)).toBe(true);
    });

    it('should validate stock entry form data', () => {
      expect(isILedgerForm(VALID_STOCK_ENTRY_FORM)).toBe(true);
    });

    it('should validate transaction form data', () => {
      expect(isILedgerForm(VALID_TRANSACTION_FORM)).toBe(true);
    });

    it('should reject invalid form objects', () => {
      expect(isILedgerForm({})).toBe(false);
      expect(isILedgerForm(null)).toBe(false);
      expect(isILedgerForm(undefined)).toBe(false);
      expect(isILedgerForm('string')).toBe(false);
      expect(isILedgerForm(123)).toBe(false);
    });

    it('should reject forms with missing required fields', () => {
      const incompleteRefillForm = {
        account: 'acc_456'
        // Missing other required fields
      };
      expect(isILedgerForm(incompleteRefillForm)).toBe(false);

      const incompleteTransactionForm = {
        accountId: 'acc_456',
        type: TransactionType.Debit
        // Missing other required fields
      };
      expect(isILedgerForm(incompleteTransactionForm)).toBe(false);
    });

    it('should reject forms with invalid field types', () => {
      const invalidRefillForm = {
        ...VALID_REFILL_FORM,
        amount: 123, // Should be string for form
      };
      expect(isILedgerForm(invalidRefillForm)).toBe(false);
    });

    it('should handle optional fields correctly', () => {
      const stockFormWithoutNote: IStockEntryForm = {
        productId: 'prod_456',
        type: StockEntryType.Overage, // Use valid enum value
        delta: 5n, // Use bigint
        cost: 5000n // Use bigint
        // notes is optional
      };
      expect(isILedgerForm(stockFormWithoutNote)).toBe(true);

      const refillFormWithoutNote: IRefillForm = {
        account: 'acc_456',
        method: RefillMethods.Stripe,
        amount: 2500n // Use bigint
        // note is optional
      };
      expect(isILedgerForm(refillFormWithoutNote)).toBe(true);
    });
  });

  describe('ILedgerDocument Type and isILedgerDocument Type Guard', () => {
    it('should reject invalid document objects', () => {
      expect(isILedgerDocument({})).toBe(false);
      expect(isILedgerDocument(null)).toBe(false);
      expect(isILedgerDocument(undefined)).toBe(false);
      expect(isILedgerDocument('string')).toBe(false);
      expect(isILedgerDocument(123)).toBe(false);
    });

    it('should reject documents missing database fields', () => {
      // Regular ledger entries without MongoDB fields should fail document validation
      expect(isILedgerDocument(VALID_REFILL)).toBe(false);
      expect(isILedgerDocument(VALID_TRANSACTION)).toBe(false);
    });

    // Note: Testing actual Document instances is complex due to Mongoose dependencies
    // In real usage, these would be validated after database retrieval
  });

  describe('Type Discrimination', () => {
    it('should allow proper type discrimination for ILedger', () => {
      const ledgers: ILedger[] = [
        VALID_REFILL,
        VALID_PREORDER,
        VALID_STOCK_ENTRY,
        VALID_TRANSACTION
      ];

      let refillCount = 0;
      let preorderCount = 0;
      let stockCount = 0;
      let transactionCount = 0;

      ledgers.forEach(ledger => {
        if ('method' in ledger && 'reference' in ledger) {
          // This is likely a refill
          refillCount++;
        } else if ('productId' in ledger && 'status' in ledger && !('type' in ledger)) {
          // This is likely a preorder
          preorderCount++;
        } else if ('productId' in ledger && 'type' in ledger) {
          // This is likely a stock entry
          stockCount++;
        } else if ('reason' in ledger && 'products' in ledger) {
          // This is likely a transaction
          transactionCount++;
        }
      });

      expect(refillCount).toBe(1);
      expect(preorderCount).toBe(1);
      expect(stockCount).toBe(1);
      expect(transactionCount).toBe(1);
    });

    it('should handle mixed arrays of different ledger types', () => {
      const mixedLedgers = [
        VALID_REFILL,
        VALID_TRANSACTION,
        VALID_PREORDER
      ];

      mixedLedgers.forEach(ledger => {
        expect(isILedger(ledger)).toBe(true);
      });
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large arrays efficiently', () => {
      const largeLedgerArray: ILedger[] = Array(1000).fill(null).map((_, index) => ({
        ...VALID_TRANSACTION,
        id: `trans_${index}`,
        total: BigInt(index * 100)
      }));

      const startTime = Date.now();
      largeLedgerArray.forEach(ledger => {
        expect(isILedger(ledger)).toBe(true);
      });
      const endTime = Date.now();

      // Performance should be reasonable (less than 1 second for 1000 items)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should handle deeply nested objects correctly', () => {
      const complexTransaction: ITransaction = {
        ...VALID_TRANSACTION,
        products: Array(100).fill(null).map((_, index) => ({
          name: `Product ${index}`,
          description: `Description for product ${index}`,
          price: `${(index + 1) * 5}.00`,
          amount: `${index + 1}`,
          total: `${(index + 1) * 5 * (index + 1)}.00`
        }))
      };

      expect(isILedger(complexTransaction)).toBe(true);
    });

    it('should handle special numeric values', () => {
      const edgeCaseRefill: IRefill = {
        ...VALID_REFILL,
        amount: 0n, // Zero amount
        cost: 1n,   // Minimal cost
      };
      expect(isILedger(edgeCaseRefill)).toBe(true);

      const largeAmountRefill: IRefill = {
        ...VALID_REFILL,
        amount: 999999999999999999n, // Very large amount
        cost: 999999999999999999n,
      };
      expect(isILedger(largeAmountRefill)).toBe(true);
    });

    it('should handle special date values', () => {
      const oldDateTransaction: ITransaction = {
        ...VALID_TRANSACTION,
        date: new Date('1970-01-01T00:00:00.000Z') // Unix epoch
      };
      expect(isILedger(oldDateTransaction)).toBe(true);

      const futureDateTransaction: ITransaction = {
        ...VALID_TRANSACTION,
        date: new Date('2099-12-31T23:59:59.999Z') // Far future
      };
      expect(isILedger(futureDateTransaction)).toBe(true);
    });
  });

  describe('Type Guard Consistency', () => {
    it('should maintain consistency between type guards', () => {
      // If something is a valid ledger form, it should be consistent
      expect(isILedgerForm(VALID_REFILL_FORM)).toBe(true);
      expect(isILedgerForm(VALID_TRANSACTION_FORM)).toBe(true);
      
      // Ledger entries should validate correctly
      expect(isILedger(VALID_REFILL)).toBe(true);
      expect(isILedger(VALID_TRANSACTION)).toBe(true);
    });

    it('should reject the same invalid data consistently', () => {
      const invalidData = { invalid: 'data' };
      
      expect(isILedger(invalidData)).toBe(false);
      expect(isILedgerForm(invalidData)).toBe(false);
      expect(isILedgerDocument(invalidData)).toBe(false);
    });
  });
});
