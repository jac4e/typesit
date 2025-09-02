/**
 * @fileoverview Test suite for refill module types and validation functions.
 */

import { 
  IRefill,
  IRefillForm,
  RefillMethods,
  RefillStatus,
  isIRefill,
  isIRefillForm,
  keysIRefill,
  keysIRefillForm
} from './refill';

describe('Refill Module', () => {
  // Test data constants
  const VALID_REFILL: IRefill = {
    id: 'refill_123456789',
    account: 'acc_987654321',
    method: RefillMethods.Etransfer,
    reference: 'etf_ref_abc123',
    amount: 2500n, // $25.00 in cents
    cost: 2525n, // $25.25 including processing fee
    dateCreated: new Date('2023-01-01T12:00:00.000Z'),
    dateUpdated: new Date('2023-01-01T12:05:00.000Z'),
    status: RefillStatus.Complete,
    note: 'Standard e-transfer refill',
  };

  const VALID_REFILL_FORM: IRefillForm = {
    account: 'acc_987654321',
    method: RefillMethods.CreditCard,
    amount: 5000n, // $50.00
  };

  describe('RefillMethods enum', () => {
    it('should have correct method values', () => {
      expect(RefillMethods.Cash).toBe('cash');
      expect(RefillMethods.Etransfer).toBe('etransfer');
      expect(RefillMethods.CreditCard).toBe('creditcard');
      expect(RefillMethods.DebitCard).toBe('debitcard');
      expect(RefillMethods.Stripe).toBe('stripe');
    });

    it('should contain all expected payment methods', () => {
      const methods = Object.values(RefillMethods);
      expect(methods).toContain('cash');
      expect(methods).toContain('etransfer');
      expect(methods).toContain('creditcard');
      expect(methods).toContain('debitcard');
      expect(methods).toContain('stripe');
      expect(methods).toHaveLength(5);
    });
  });

  describe('RefillStatus enum', () => {
    it('should have correct status values', () => {
      expect(RefillStatus.Pending).toBe('pending');
      expect(RefillStatus.Complete).toBe('complete');
      expect(RefillStatus.Failed).toBe('failed');
      expect(RefillStatus.Cancelled).toBe('cancelled');
    });

    it('should contain all expected status types', () => {
      const statuses = Object.values(RefillStatus);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('complete');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('cancelled');
      expect(statuses).toHaveLength(4);
    });
  });

  describe('Key arrays', () => {
    it('should have correct IRefill keys', () => {
      const expectedKeys = [
        'id', 'account', 'method', 'reference', 'amount', 
        'cost', 'dateCreated', 'dateUpdated', 'status', 'note'
      ];
      expect(keysIRefill).toEqual(expectedKeys);
    });

    it('should have correct IRefillForm keys', () => {
      const expectedKeys = ['account', 'method', 'amount'];
      expect(keysIRefillForm).toEqual(expectedKeys);
    });
  });

  describe('isIRefill type guard', () => {
    it('should return true for valid refill with all properties', () => {
      expect(isIRefill(VALID_REFILL)).toBe(true);
    });

    it('should return true for valid refill without optional note', () => {
      const refillWithoutNote = { ...VALID_REFILL, note: undefined };
      expect(isIRefill(refillWithoutNote)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_REFILL, id: undefined },
        { ...VALID_REFILL, account: undefined },
        { ...VALID_REFILL, method: undefined },
        { ...VALID_REFILL, reference: undefined },
        { ...VALID_REFILL, amount: undefined },
        { ...VALID_REFILL, cost: undefined },
        { ...VALID_REFILL, dateCreated: undefined },
        { ...VALID_REFILL, dateUpdated: undefined },
        { ...VALID_REFILL, status: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefill(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      const testCases = [
        { ...VALID_REFILL, id: 123 },
        { ...VALID_REFILL, account: 123 },
        { ...VALID_REFILL, method: 'invalid_method' },
        { ...VALID_REFILL, reference: 123 },
        { ...VALID_REFILL, amount: '2500' },
        { ...VALID_REFILL, cost: '2525' },
        { ...VALID_REFILL, dateCreated: 'invalid-date' },
        { ...VALID_REFILL, dateUpdated: 'invalid-date' },
        { ...VALID_REFILL, status: 'invalid_status' },
        { ...VALID_REFILL, note: 123 },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefill(testCase)).toBe(false);
      });
    });

    it('should return false for invalid method values', () => {
      const testCases = [
        { ...VALID_REFILL, method: 'paypal' },
        { ...VALID_REFILL, method: 'bitcoin' },
        { ...VALID_REFILL, method: 'check' },
        { ...VALID_REFILL, method: '' },
        { ...VALID_REFILL, method: null },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefill(testCase)).toBe(false);
      });
    });

    it('should return false for invalid status values', () => {
      const testCases = [
        { ...VALID_REFILL, status: 'processing' },
        { ...VALID_REFILL, status: 'approved' },
        { ...VALID_REFILL, status: 'rejected' },
        { ...VALID_REFILL, status: '' },
        { ...VALID_REFILL, status: null },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefill(testCase)).toBe(false);
      });
    });

    it('should return false for extra properties', () => {
      const refillWithExtra = { ...VALID_REFILL, extraProperty: 'extra' };
      expect(isIRefill(refillWithExtra)).toBe(false);
    });

    it('should handle different refill methods', () => {
      const methods = Object.values(RefillMethods);
      methods.forEach((method) => {
        const refill = { ...VALID_REFILL, method };
        expect(isIRefill(refill)).toBe(true);
      });
    });

    it('should handle different refill statuses', () => {
      const statuses = Object.values(RefillStatus);
      statuses.forEach((status) => {
        const refill = { ...VALID_REFILL, status };
        expect(isIRefill(refill)).toBe(true);
      });
    });

    it('should handle zero amounts and costs', () => {
      const zeroRefill = { ...VALID_REFILL, amount: 0n, cost: 0n };
      expect(isIRefill(zeroRefill)).toBe(true);
    });

    it('should handle large BigInt values', () => {
      const largeRefill = { 
        ...VALID_REFILL, 
        amount: 999999999n, 
        cost: 1000000000n 
      };
      expect(isIRefill(largeRefill)).toBe(true);
    });
  });

  describe('isIRefillForm type guard', () => {
    it('should return true for valid refill form', () => {
      expect(isIRefillForm(VALID_REFILL_FORM)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_REFILL_FORM, account: undefined },
        { ...VALID_REFILL_FORM, method: undefined },
        { ...VALID_REFILL_FORM, amount: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefillForm(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      const testCases = [
        { ...VALID_REFILL_FORM, account: 123 },
        { ...VALID_REFILL_FORM, method: 'invalid_method' },
        { ...VALID_REFILL_FORM, amount: '5000' },
      ];

      testCases.forEach((testCase) => {
        expect(isIRefillForm(testCase)).toBe(false);
      });
    });

    it('should return false if it contains excluded properties', () => {
      const formWithId = { ...VALID_REFILL_FORM, id: 'should_not_be_here' };
      const formWithStatus = { ...VALID_REFILL_FORM, status: RefillStatus.Pending };
      const formWithDates = { ...VALID_REFILL_FORM, dateCreated: new Date() };

      expect(isIRefillForm(formWithId)).toBe(false);
      expect(isIRefillForm(formWithStatus)).toBe(false);
      expect(isIRefillForm(formWithDates)).toBe(false);
    });

    it('should handle all valid payment methods', () => {
      const methods = Object.values(RefillMethods);
      methods.forEach((method) => {
        const form = { ...VALID_REFILL_FORM, method };
        expect(isIRefillForm(form)).toBe(true);
      });
    });

    it('should handle zero amount', () => {
      const zeroForm = { ...VALID_REFILL_FORM, amount: 0n };
      expect(isIRefillForm(zeroForm)).toBe(true);
    });

    it('should handle large amounts', () => {
      const largeForm = { ...VALID_REFILL_FORM, amount: 1000000n };
      expect(isIRefillForm(largeForm)).toBe(true);
    });
  });

  describe('Refill business logic scenarios', () => {
    it('should represent different payment workflows', () => {
      const cashRefill: IRefill = {
        ...VALID_REFILL,
        method: RefillMethods.Cash,
        reference: 'cash_receipt_001',
        amount: 2000n,
        cost: 2000n, // No processing fee for cash
        status: RefillStatus.Complete,
      };

      const stripeRefill: IRefill = {
        ...VALID_REFILL,
        method: RefillMethods.Stripe,
        reference: 'stripe_pi_123abc',
        amount: 5000n,
        cost: 5150n, // 3% processing fee
        status: RefillStatus.Pending,
      };

      expect(isIRefill(cashRefill)).toBe(true);
      expect(isIRefill(stripeRefill)).toBe(true);
      expect(cashRefill.amount).toBe(cashRefill.cost); // No fee
      expect(stripeRefill.cost).toBeGreaterThan(stripeRefill.amount); // With fee
    });

    it('should handle failed refill scenarios', () => {
      const failedRefill: IRefill = {
        ...VALID_REFILL,
        status: RefillStatus.Failed,
        note: 'Credit card declined - insufficient funds',
      };

      expect(isIRefill(failedRefill)).toBe(true);
      expect(failedRefill.status).toBe(RefillStatus.Failed);
    });

    it('should handle cancelled refill scenarios', () => {
      const cancelledRefill: IRefill = {
        ...VALID_REFILL,
        status: RefillStatus.Cancelled,
        note: 'User cancelled during processing',
      };

      expect(isIRefill(cancelledRefill)).toBe(true);
      expect(cancelledRefill.status).toBe(RefillStatus.Cancelled);
    });

    it('should track refill processing time', () => {
      const createdDate = new Date('2023-01-01T12:00:00.000Z');
      const updatedDate = new Date('2023-01-01T12:30:00.000Z');
      
      const timedRefill: IRefill = {
        ...VALID_REFILL,
        dateCreated: createdDate,
        dateUpdated: updatedDate,
      };

      expect(timedRefill.dateUpdated.getTime()).toBeGreaterThan(timedRefill.dateCreated.getTime());
      const processingTime = timedRefill.dateUpdated.getTime() - timedRefill.dateCreated.getTime();
      expect(processingTime).toBe(30 * 60 * 1000); // 30 minutes
    });

    it('should handle various reference formats', () => {
      const refillReferences = [
        'etf_12345',
        'stripe_pi_1234567890',
        'cash_receipt_001',
        'CC-VISA-4532',
        'manual_refill_admin_001',
        'REFUND-ORD-123',
      ];

      refillReferences.forEach((reference) => {
        const refill = { ...VALID_REFILL, reference };
        expect(isIRefill(refill)).toBe(true);
        expect(refill.reference).toBe(reference);
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle minimum refill amounts', () => {
      const minRefill: IRefill = {
        ...VALID_REFILL,
        amount: 1n, // 1 cent
        cost: 1n,
      };

      expect(isIRefill(minRefill)).toBe(true);
    });

    it('should handle maximum realistic refill amounts', () => {
      const maxRefill: IRefill = {
        ...VALID_REFILL,
        amount: 100000n, // $1000
        cost: 103000n,   // $1030 with fees
      };

      expect(isIRefill(maxRefill)).toBe(true);
    });

    it('should handle empty reference strings', () => {
      const emptyRefRefill = { ...VALID_REFILL, reference: '' };
      expect(isIRefill(emptyRefRefill)).toBe(true);
    });

    it('should handle long notes', () => {
      const longNote = 'A'.repeat(1000);
      const verboseRefill = { ...VALID_REFILL, note: longNote };
      expect(isIRefill(verboseRefill)).toBe(true);
      expect(verboseRefill.note).toHaveLength(1000);
    });

    it('should handle date edge cases', () => {
      const epochRefill: IRefill = {
        ...VALID_REFILL,
        dateCreated: new Date(0),
        dateUpdated: new Date(1000),
      };

      expect(isIRefill(epochRefill)).toBe(true);
      expect(epochRefill.dateCreated.getTime()).toBe(0);
    });

    it('should handle same created and updated dates', () => {
      const instantRefill: IRefill = {
        ...VALID_REFILL,
        dateCreated: new Date('2023-01-01T12:00:00.000Z'),
        dateUpdated: new Date('2023-01-01T12:00:00.000Z'),
      };

      expect(isIRefill(instantRefill)).toBe(true);
      expect(instantRefill.dateCreated.getTime()).toBe(instantRefill.dateUpdated.getTime());
    });
  });

  describe('Type safety and relationships', () => {
    it('should work with object destructuring', () => {
      const { id, account, method, amount, status } = VALID_REFILL;
      expect(id).toBe('refill_123456789');
      expect(account).toBe('acc_987654321');
      expect(method).toBe(RefillMethods.Etransfer);
      expect(amount).toBe(2500n);
      expect(status).toBe(RefillStatus.Complete);
    });

    it('should work with object spreading', () => {
      const extendedRefill = {
        ...VALID_REFILL,
        metadata: { source: 'mobile_app' },
        processed: true,
      };

      expect(extendedRefill.id).toBe(VALID_REFILL.id);
      expect(extendedRefill.metadata.source).toBe('mobile_app');
      expect(extendedRefill.processed).toBe(true);
    });

    it('should maintain consistency between form and full refill', () => {
      expect(VALID_REFILL.account).toBeDefined();
      expect(VALID_REFILL.method).toBeDefined();
      expect(VALID_REFILL.amount).toBeDefined();
      
      expect(VALID_REFILL_FORM.account).toBeDefined();
      expect(VALID_REFILL_FORM.method).toBeDefined();
      expect(VALID_REFILL_FORM.amount).toBeDefined();
    });

    it('should handle BigInt arithmetic operations', () => {
      const refill1: IRefill = { ...VALID_REFILL, amount: 1000n, cost: 1030n };
      const refill2: IRefill = { ...VALID_REFILL, amount: 2000n, cost: 2060n };
      
      const totalAmount = refill1.amount + refill2.amount;
      const totalCost = refill1.cost + refill2.cost;
      
      expect(totalAmount).toBe(3000n);
      expect(totalCost).toBe(3090n);
    });
  });
});
