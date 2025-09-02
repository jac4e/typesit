/**
 * @fileoverview Test suite for transaction module types and validation functions.
 */

import { 
  ITransaction,
  ITransactionItem,
  ITransactionForm,
  ITransactionDocument,
  TransactionType,
  isITransaction,
  isITransactionForm,
  keysITransaction
} from './transaction';

describe('Transaction Module', () => {
  // Test data constants
  const VALID_TRANSACTION_ITEM: ITransactionItem = {
    name: 'Energy Drink',
    description: 'Caffeinated beverage for energy',
    price: '250', // $2.50 as string
    amount: '2',  // 2 items as string
    total: '500', // $5.00 total as string
  };

  const VALID_TRANSACTION: ITransaction = {
    date: new Date('2023-01-01T12:00:00.000Z'),
    id: 'txn_123456789',
    accountId: 'acc_987654321',
    type: TransactionType.Debit,
    reason: 'Store purchase',
    products: [VALID_TRANSACTION_ITEM],
    total: 500n, // $5.00 in cents
  };

  const VALID_TRANSACTION_FORM: ITransactionForm = {
    accountId: 'acc_987654321',
    type: TransactionType.Credit,
    reason: 'Account refill',
    products: [],
    total: '2500', // $25.00 as string
  };

  describe('TransactionType enum', () => {
    it('should have correct transaction type values', () => {
      expect(TransactionType.Debit).toBe('debit');
      expect(TransactionType.Credit).toBe('credit');
    });

    it('should contain all expected transaction types', () => {
      const types = Object.values(TransactionType);
      expect(types).toContain('debit');
      expect(types).toContain('credit');
      expect(types).toHaveLength(2);
    });
  });

  describe('keysITransaction', () => {
    it('should contain all ITransaction keys in correct order', () => {
      const expectedKeys = ['date', 'id', 'accountId', 'type', 'reason', 'products', 'total'];
      expect(keysITransaction).toEqual(expectedKeys);
    });
  });

  describe('ITransactionItem interface', () => {
    it('should accept valid transaction items', () => {
      const item: ITransactionItem = {
        name: 'Test Product',
        description: 'A test product description',
        price: '199',
        amount: '3',
        total: '597',
      };

      expect(item.name).toBe('Test Product');
      expect(item.description).toBe('A test product description');
      expect(item.price).toBe('199');
      expect(item.amount).toBe('3');
      expect(item.total).toBe('597');
    });

    it('should handle items without description', () => {
      const item: ITransactionItem = {
        name: 'Simple Product',
        price: '100',
        amount: '1',
        total: '100',
      };

      expect(item.description).toBeUndefined();
      expect(item.name).toBe('Simple Product');
    });

    it('should handle zero amounts and totals', () => {
      const zeroItem: ITransactionItem = {
        name: 'Free Sample',
        price: '0',
        amount: '1',
        total: '0',
      };

      expect(zeroItem.price).toBe('0');
      expect(zeroItem.total).toBe('0');
    });

    it('should handle large amounts as strings', () => {
      const largeItem: ITransactionItem = {
        name: 'Bulk Order',
        price: '999',
        amount: '1000',
        total: '999000',
      };

      expect(largeItem.amount).toBe('1000');
      expect(largeItem.total).toBe('999000');
    });
  });

  describe('isITransaction type guard', () => {
    it('should return true for valid transaction', () => {
      expect(isITransaction(VALID_TRANSACTION)).toBe(true);
    });

    it('should return true for transaction with string date', () => {
      const transactionWithStringDate = {
        ...VALID_TRANSACTION,
        date: '2023-01-01T12:00:00.000Z',
      };
      expect(isITransaction(transactionWithStringDate)).toBe(true);
    });

    it('should return true for transaction with empty products array', () => {
      const transactionWithEmptyProducts = {
        ...VALID_TRANSACTION,
        products: [],
      };
      expect(isITransaction(transactionWithEmptyProducts)).toBe(true);
    });

    it('should return true for transaction with multiple products', () => {
      const multiProductTransaction = {
        ...VALID_TRANSACTION,
        products: [
          VALID_TRANSACTION_ITEM,
          {
            name: 'Snack Bar',
            price: '150',
            amount: '1',
            total: '150',
          },
          {
            name: 'Coffee',
            description: 'Hot brewed coffee',
            price: '300',
            amount: '2',
            total: '600',
          },
        ],
      };
      expect(isITransaction(multiProductTransaction)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_TRANSACTION, date: undefined },
        { ...VALID_TRANSACTION, id: undefined },
        { ...VALID_TRANSACTION, accountId: undefined },
        { ...VALID_TRANSACTION, type: undefined },
        { ...VALID_TRANSACTION, reason: undefined },
        { ...VALID_TRANSACTION, products: undefined },
        { ...VALID_TRANSACTION, total: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isITransaction(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      // Note: These test cases focus on clearly invalid types that typia should catch
      // Some edge cases (like invalid date strings) may not be caught by typia
      const testCases = [
        {
          date: new Date('2023-01-01T12:00:00.000Z'),
          id: 123 as any, // Should be string - this should fail
          accountId: 'acc_987654321',
          type: TransactionType.Debit,
          reason: 'Store purchase',
          products: [VALID_TRANSACTION_ITEM],
          total: 500n,
        },
        {
          date: new Date('2023-01-01T12:00:00.000Z'),
          id: 'txn_123456789',
          accountId: 'acc_987654321',
          type: 'clearly_invalid_enum_value' as any, // Should be TransactionType
          reason: 'Store purchase',
          products: [VALID_TRANSACTION_ITEM],
          total: 500n,
        },
        {
          date: new Date('2023-01-01T12:00:00.000Z'),
          id: 'txn_123456789',
          accountId: 'acc_987654321',
          type: TransactionType.Debit,
          reason: 'Store purchase',
          products: 'definitely_not_an_array' as any, // Should be array
          total: 500n,
        },
      ];

      testCases.forEach((testCase, index) => {
        const result = isITransaction(testCase);
        expect(result).toBe(false);
      });
    });

    it('should return false for invalid transaction types', () => {
      const testCases = [
        { ...VALID_TRANSACTION, type: 'withdrawal' },
        { ...VALID_TRANSACTION, type: 'deposit' },
        { ...VALID_TRANSACTION, type: 'transfer' },
        { ...VALID_TRANSACTION, type: '' },
        { ...VALID_TRANSACTION, type: null },
      ];

      testCases.forEach((testCase) => {
        expect(isITransaction(testCase)).toBe(false);
      });
    });

    it('should return false for invalid product items', () => {
      const invalidProductTransaction = {
        ...VALID_TRANSACTION,
        products: [
          { ...VALID_TRANSACTION_ITEM, name: undefined }, // Missing required field
        ],
      };
      expect(isITransaction(invalidProductTransaction)).toBe(false);
    });

    it('should return false for extra properties', () => {
      const transactionWithExtra = { ...VALID_TRANSACTION, extraProperty: 'extra' };
      expect(isITransaction(transactionWithExtra)).toBe(false);
    });

    it('should handle both transaction types', () => {
      const debitTransaction = { ...VALID_TRANSACTION, type: TransactionType.Debit };
      const creditTransaction = { ...VALID_TRANSACTION, type: TransactionType.Credit };

      expect(isITransaction(debitTransaction)).toBe(true);
      expect(isITransaction(creditTransaction)).toBe(true);
    });

    it('should handle zero and negative totals', () => {
      const zeroTransaction = { ...VALID_TRANSACTION, total: 0n };
      const negativeTransaction = { ...VALID_TRANSACTION, total: -500n };

      expect(isITransaction(zeroTransaction)).toBe(true);
      expect(isITransaction(negativeTransaction)).toBe(true);
    });

    it('should handle large BigInt totals', () => {
      const largeTransaction = { ...VALID_TRANSACTION, total: 999999999n };
      expect(isITransaction(largeTransaction)).toBe(true);
    });
  });

  describe('isITransactionForm type guard', () => {
    it('should return true for valid transaction form', () => {
      expect(isITransactionForm(VALID_TRANSACTION_FORM)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_TRANSACTION_FORM, accountId: undefined },
        { ...VALID_TRANSACTION_FORM, type: undefined },
        { ...VALID_TRANSACTION_FORM, reason: undefined },
        { ...VALID_TRANSACTION_FORM, products: undefined },
        { ...VALID_TRANSACTION_FORM, total: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isITransactionForm(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      const testCases = [
        { ...VALID_TRANSACTION_FORM, accountId: 123 },
        { ...VALID_TRANSACTION_FORM, type: 'invalid_type' },
        { ...VALID_TRANSACTION_FORM, reason: 123 },
        { ...VALID_TRANSACTION_FORM, products: 'not an array' },
        { ...VALID_TRANSACTION_FORM, total: 2500 }, // Should be string
      ];

      testCases.forEach((testCase) => {
        expect(isITransactionForm(testCase)).toBe(false);
      });
    });

    it('should return false if it contains excluded properties', () => {
      const formWithId = { ...VALID_TRANSACTION_FORM, id: 'should_not_be_here' };
      const formWithDate = { ...VALID_TRANSACTION_FORM, date: new Date() };

      expect(isITransactionForm(formWithId)).toBe(false);
      expect(isITransactionForm(formWithDate)).toBe(false);
    });

    it('should handle empty products array', () => {
      const formWithEmptyProducts = { ...VALID_TRANSACTION_FORM, products: [] };
      expect(isITransactionForm(formWithEmptyProducts)).toBe(true);
    });

    it('should handle forms with products', () => {
      const formWithProducts = {
        ...VALID_TRANSACTION_FORM,
        products: [VALID_TRANSACTION_ITEM],
      };
      expect(isITransactionForm(formWithProducts)).toBe(true);
    });

    it('should handle zero and large string totals', () => {
      const zeroForm = { ...VALID_TRANSACTION_FORM, total: '0' };
      const largeForm = { ...VALID_TRANSACTION_FORM, total: '999999999' };

      expect(isITransactionForm(zeroForm)).toBe(true);
      expect(isITransactionForm(largeForm)).toBe(true);
    });
  });

  describe('Transaction business logic scenarios', () => {
    it('should represent purchase transactions', () => {
      const purchaseTransaction: ITransaction = {
        date: new Date(),
        id: 'txn_purchase_001',
        accountId: 'acc_123',
        type: TransactionType.Debit,
        reason: 'Store purchase',
        products: [
          {
            name: 'Coffee',
            price: '300',
            amount: '1',
            total: '300',
          },
          {
            name: 'Muffin',
            price: '250',
            amount: '1',
            total: '250',
          },
        ],
        total: 550n, // $5.50
      };

      expect(isITransaction(purchaseTransaction)).toBe(true);
      expect(purchaseTransaction.type).toBe(TransactionType.Debit);
      expect(purchaseTransaction.products).toHaveLength(2);
    });

    it('should represent refill transactions', () => {
      const refillTransaction: ITransaction = {
        date: new Date(),
        id: 'txn_refill_001',
        accountId: 'acc_123',
        type: TransactionType.Credit,
        reason: 'Account refill via e-transfer',
        products: [], // No products for refills
        total: 2500n, // $25.00 added to account
      };

      expect(isITransaction(refillTransaction)).toBe(true);
      expect(refillTransaction.type).toBe(TransactionType.Credit);
      expect(refillTransaction.products).toHaveLength(0);
    });

    it('should represent refund transactions', () => {
      const refundTransaction: ITransaction = {
        date: new Date(),
        id: 'txn_refund_001',
        accountId: 'acc_123',
        type: TransactionType.Credit,
        reason: 'Refund for cancelled order #12345',
        products: [
          {
            name: 'Cancelled Product',
            price: '500',
            amount: '1',
            total: '500',
          },
        ],
        total: 500n, // $5.00 refunded
      };

      expect(isITransaction(refundTransaction)).toBe(true);
      expect(refundTransaction.type).toBe(TransactionType.Credit);
      expect(refundTransaction.reason).toContain('Refund');
    });

    it('should calculate correct totals from products', () => {
      const products: ITransactionItem[] = [
        { name: 'Item 1', price: '100', amount: '2', total: '200' },
        { name: 'Item 2', price: '150', amount: '1', total: '150' },
        { name: 'Item 3', price: '75', amount: '3', total: '225' },
      ];

      const calculatedTotal = products.reduce((sum, item) => {
        return sum + parseInt(item.total);
      }, 0);

      expect(calculatedTotal).toBe(575); // $5.75
    });

    it('should handle transactions with detailed reasons', () => {
      const detailedTransaction: ITransaction = {
        date: new Date(),
        id: 'txn_detailed_001',
        accountId: 'acc_123',
        type: TransactionType.Debit,
        reason: 'Weekly grocery purchase - Employee discount applied (10%)',
        products: [VALID_TRANSACTION_ITEM],
        total: 450n, // Discounted total
      };

      expect(isITransaction(detailedTransaction)).toBe(true);
      expect(detailedTransaction.reason).toContain('discount');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle transactions with very long product names', () => {
      const longNameItem: ITransactionItem = {
        name: 'Very Long Product Name That Exceeds Normal Length Expectations For Testing Purposes',
        price: '100',
        amount: '1',
        total: '100',
      };

      const transaction = {
        ...VALID_TRANSACTION,
        products: [longNameItem],
      };

      expect(isITransaction(transaction)).toBe(true);
    });

    it('should handle transactions with decimal string amounts', () => {
      const decimalItem: ITransactionItem = {
        name: 'Fractional Product',
        price: '1.50',
        amount: '2.5',
        total: '3.75',
      };

      // Note: This tests if the type system accepts these,
      // though business logic might reject decimals
      expect(decimalItem.price).toBe('1.50');
      expect(decimalItem.amount).toBe('2.5');
    });

    it('should handle empty reason strings', () => {
      const emptyReasonTransaction = { ...VALID_TRANSACTION, reason: '' };
      expect(isITransaction(emptyReasonTransaction)).toBe(true);
    });

    it('should handle very long reason strings', () => {
      const longReason = 'A'.repeat(1000);
      const verboseTransaction = { ...VALID_TRANSACTION, reason: longReason };
      expect(isITransaction(verboseTransaction)).toBe(true);
      expect(verboseTransaction.reason).toHaveLength(1000);
    });

    it('should handle date edge cases', () => {
      const epochTransaction = {
        ...VALID_TRANSACTION,
        date: new Date(0),
      };

      expect(isITransaction(epochTransaction)).toBe(true);
      expect((epochTransaction.date as Date).getTime()).toBe(0);
    });

    it('should handle maximum realistic transaction amounts', () => {
      const maxTransaction = {
        ...VALID_TRANSACTION,
        total: BigInt(Number.MAX_SAFE_INTEGER),
      };

      expect(isITransaction(maxTransaction)).toBe(true);
    });
  });

  describe('Type safety and relationships', () => {
    it('should work with object destructuring', () => {
      const { id, accountId, type, reason, total } = VALID_TRANSACTION;
      expect(id).toBe('txn_123456789');
      expect(accountId).toBe('acc_987654321');
      expect(type).toBe(TransactionType.Debit);
      expect(reason).toBe('Store purchase');
      expect(total).toBe(500n);
    });

    it('should work with object spreading', () => {
      const extendedTransaction = {
        ...VALID_TRANSACTION,
        metadata: { source: 'mobile_app' },
        processed: true,
      };

      expect(extendedTransaction.id).toBe(VALID_TRANSACTION.id);
      expect(extendedTransaction.metadata.source).toBe('mobile_app');
      expect(extendedTransaction.processed).toBe(true);
    });

    it('should maintain consistency between form and full transaction', () => {
      const formFields = ['accountId', 'type', 'reason', 'products'];
      formFields.forEach((field) => {
        expect(VALID_TRANSACTION[field as keyof ITransaction]).toBeDefined();
        expect(VALID_TRANSACTION_FORM[field as keyof ITransactionForm]).toBeDefined();
      });
    });

    it('should handle BigInt arithmetic operations', () => {
      const txn1: ITransaction = { ...VALID_TRANSACTION, total: 1000n };
      const txn2: ITransaction = { ...VALID_TRANSACTION, total: 2500n };
      
      const totalAmount = txn1.total + txn2.total;
      expect(totalAmount).toBe(3500n);
    });

    it('should properly type product arrays', () => {
      const products: ITransactionItem[] = VALID_TRANSACTION.products;
      expect(Array.isArray(products)).toBe(true);
      
      products.forEach((product) => {
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('string');
        expect(typeof product.amount).toBe('string');
        expect(typeof product.total).toBe('string');
      });
    });
  });
});
