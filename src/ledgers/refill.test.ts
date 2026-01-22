/**
 * @fileoverview Tests for the refill ledger type after migrating to BaseLedgerEntry.
 */

import {
  IRefill,
  IRefillForm,
  RefillMethods,
  RefillStatus,
  isIRefill,
  isIRefillForm,
  keysIRefill,
  keysIRefillForm,
} from './refill';
import { LedgerType } from './ledgers';

describe('IRefill ledger type', () => {
  const baseCreatedAt = new Date('2024-01-01T08:00:00.000Z');
  const baseUpdatedAt = new Date('2024-01-01T08:30:00.000Z');

  const VALID_REFILL: IRefill = {
    id: 'refill_123',
    type: LedgerType.Refill,
    createdAt: baseCreatedAt,
    updatedAt: baseUpdatedAt,
    description: 'E-transfer top up',
    account: 'acc_987',
    method: RefillMethods.Etransfer,
    reference: 'etr-abc-123',
    amount: 2500n,
    cost: 2550n,
    status: RefillStatus.Pending,
  };

  const VALID_FORM: IRefillForm = {
    account: 'acc_987',
    method: RefillMethods.Cash,
    amount: 1000n,
  };

  it('accepts a ledger entry with base fields', () => {
    expect(isIRefill(VALID_REFILL)).toBe(true);
  });

  it('rejects entries missing any base ledger field', () => {
    const cases: unknown[] = [
      { ...VALID_REFILL, createdAt: undefined },
      { ...VALID_REFILL, updatedAt: undefined },
      { ...VALID_REFILL, type: LedgerType.Stock },
    ];

    cases.forEach(sample => {
      expect(isIRefill(sample)).toBe(false);
    });
  });

  it('rejects entries with invalid property types', () => {
    const invalidAmount = { ...VALID_REFILL, amount: '2500' } as unknown;
    const invalidStatus = { ...VALID_REFILL, status: 'unknown' } as unknown;
    const invalidDates = { ...VALID_REFILL, createdAt: '2024-01-01' } as unknown;

    [invalidAmount, invalidStatus, invalidDates].forEach(sample => {
      expect(isIRefill(sample)).toBe(false);
    });
  });

  it('exposes the BaseLedgerEntry keys together with refill fields', () => {
    const expectedKeys = [
      'id',
      'createdAt',
      'updatedAt',
      'type',
      'description',
      'account',
      'method',
      'reference',
      'amount',
      'cost',
      'status',
    ];

    expect(keysIRefill).toHaveLength(expectedKeys.length);
    expect(new Set(keysIRefill)).toEqual(new Set(expectedKeys));
  });

  it('validates refill forms independently of ledger metadata', () => {
    expect(isIRefillForm(VALID_FORM)).toBe(true);

    const withType = { ...VALID_FORM, type: LedgerType.Refill } as unknown;
    expect(isIRefillForm(withType)).toBe(false);
  });

  it('lists the expected refill form keys', () => {
    expect(keysIRefillForm).toEqual(['account', 'method', 'amount']);
  });
});
