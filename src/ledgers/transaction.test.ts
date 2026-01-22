/**
 * @fileoverview Tests for the transaction ledger type after migrating to BaseLedgerEntry.
 */

import {
  ITransaction,
  ITransactionForm,
  ITransactionItem,
  TransactionType,
  isITransaction,
  isITransactionForm,
  keysITransaction,
} from './transaction';
import { LedgerType } from './ledgers';

describe('ITransaction', () => {
  const createdAt = new Date('2024-03-01T12:00:00.000Z');
  const updatedAt = new Date('2024-03-01T12:05:00.000Z');

  const VALID_ITEM: ITransactionItem = {
    name: 'Energy Drink',
    price: '250',
    amount: '2',
    total: '500',
  };

  const VALID_TRANSACTION: ITransaction = {
    id: 'txn_123',
    type: LedgerType.Transaction,
    createdAt,
    updatedAt,
    description: 'Vending machine purchase',
    accountId: 'acc_123',
    transactionType: TransactionType.Debit,
    products: [VALID_ITEM],
    total: 500n,
  };

  const VALID_FORM: ITransactionForm = {
    type: LedgerType.Transaction,
    accountId: 'acc_123',
    transactionType: TransactionType.Credit,
    products: [],
    total: '2500',
  };

  it('accepts a valid transaction ledger entry', () => {
    expect(isITransaction(VALID_TRANSACTION)).toBe(true);
  });

  it('rejects entries missing base ledger metadata', () => {
    const missingType = { ...VALID_TRANSACTION, type: LedgerType.Refill };
    const missingCreated = { ...VALID_TRANSACTION, createdAt: undefined } as unknown;

    expect(isITransaction(missingType)).toBe(false);
    expect(isITransaction(missingCreated)).toBe(false);
  });

  it('rejects entries with invalid totals or products', () => {
    const invalidTotal = { ...VALID_TRANSACTION, total: '500' } as unknown;
    const invalidProducts = { ...VALID_TRANSACTION, products: 'not-an-array' } as unknown;

    expect(isITransaction(invalidTotal)).toBe(false);
    expect(isITransaction(invalidProducts)).toBe(false);
  });

  it('reports the BaseLedgerEntry keys alongside transaction fields', () => {
    const expectedKeys = [
      'id',
      'createdAt',
      'updatedAt',
      'type',
      'description',
      'accountId',
      'transactionType',
      'products',
      'total',
    ];

    expect(keysITransaction).toHaveLength(expectedKeys.length);
    expect(new Set(keysITransaction)).toEqual(new Set(expectedKeys));
  });

  it('validates transaction forms and rejects ledger metadata leakage', () => {
    expect(isITransactionForm(VALID_FORM)).toBe(true);
    const withoutType = { ...VALID_FORM } as Record<string, unknown>;
    delete withoutType.type;
    expect(isITransactionForm(withoutType)).toBe(false);
  });
});

describe('ITransactionItem', () => {
  it('allows optional description metadata', () => {
    const item: ITransactionItem = {
      name: 'Protein Bar',
      description: 'Peanut butter flavour',
      price: '350',
      amount: '1',
      total: '350',
    };

    expect(item.description).toBe('Peanut butter flavour');
  });
});
