/**
 * @fileoverview Sanity checks for the unified ledger helpers after migrating to
 * BaseLedgerEntry-powered sub types.
 */

import {
  ILedger,
  ILedgerDocument,
  ILedgerForm,
  LedgerType,
  isILedger,
  isILedgerDocument,
  isILedgerForm,
} from './ledgers';
import { IRefill, IRefillForm, RefillMethods, RefillStatus } from './refill';
import { IStockEntry, IStockEntryForm, StockEntryType } from './stock';
import { ITransaction, ITransactionForm, TransactionType } from './transaction';
import { IPreOrder, IPreOrderForm, PreOrderStatus } from './preorders';

describe('ILedger union', () => {
  const createdAt = new Date('2024-05-01T10:00:00.000Z');
  const updatedAt = new Date('2024-05-01T10:05:00.000Z');

  const REFILL: IRefill = {
    id: 'refill_001',
    type: LedgerType.Refill,
    createdAt,
    updatedAt,
    account: 'acc_001',
    method: RefillMethods.Cash,
    reference: 'cash_receipt_001',
    amount: 500n,
    cost: 500n,
    status: RefillStatus.Complete,
  };

  const STOCK: IStockEntry<StockEntryType.Shrinkage> = {
    id: 'stock_001',
    type: LedgerType.Stock,
    createdAt,
    updatedAt,
    entryType: StockEntryType.Shrinkage,
    productId: 'prod_001',
    delta: -1n,
  };

  const TRANSACTION: ITransaction = {
    id: 'txn_001',
    type: LedgerType.Transaction,
    createdAt,
    updatedAt,
    accountId: 'acc_001',
    transactionType: TransactionType.Credit,
    products: [],
    total: 500n,
  };

  const PREORDER: IPreOrder = {
    id: 'pre_001',
    type: LedgerType.PreOrder,
    createdAt,
    updatedAt,
    accountId: 'acc_001',
    productId: 'prod_002',
    amount: 2n,
    status: PreOrderStatus.Ordered,
  };

  const LEDGER_ENTRIES: ILedger[] = [REFILL, STOCK, TRANSACTION, PREORDER];

  it('accepts every supported ledger subtype', () => {
    LEDGER_ENTRIES.forEach(entry => expect(isILedger(entry)).toBe(true));
  });

  it('rejects payloads with mismatched ledger discriminators', () => {
    const wrongType = { ...REFILL, type: LedgerType.Stock };
    expect(isILedger(wrongType)).toBe(false);
  });

  it('accepts ledger forms without BaseLedgerEntry metadata', () => {
    const forms: ILedgerForm[] = [
      {
        account: 'acc_001',
        method: RefillMethods.Stripe,
        amount: 1500n,
      } satisfies IRefillForm,
      {
        entryType: StockEntryType.Sale,
        productId: 'prod_001',
        delta: -3n,
      } satisfies IStockEntryForm<StockEntryType.Sale>,
      {
        type: LedgerType.Transaction,
        accountId: 'acc_001',
        transactionType: TransactionType.Debit,
        products: [],
        total: '2500',
      } satisfies ITransactionForm,
      {
        type: LedgerType.PreOrder,
        accountId: 'acc_001',
        productId: 'prod_002',
        amount: 1n,
        status: PreOrderStatus.Ordered,
      } satisfies IPreOrderForm,
    ];

    forms.forEach(form => expect(isILedgerForm(form)).toBe(true));
  });

  it('rejects forms leaking ledger metadata', () => {
    const invalidForm = { account: 'acc_001', method: RefillMethods.Cash, amount: 100n, createdAt };
    expect(isILedgerForm(invalidForm)).toBe(false);
  });

  it('rejects ledger entries when checking for documents', () => {
    expect(isILedgerDocument(REFILL)).toBe(false);
    expect(isILedgerDocument(STOCK)).toBe(false);
    expect(isILedgerDocument(TRANSACTION)).toBe(false);
    expect(isILedgerDocument(PREORDER)).toBe(false);
  });

  it('rejects documents with incorrect discriminators', () => {
    const wrong = {
      type: LedgerType.Stock,
      createdAt,
      updatedAt,
      accountId: 'acc_001',
      transactionType: TransactionType.Credit,
      products: [],
      total: '500',
    } as unknown as ILedgerDocument;

    expect(isILedgerDocument(wrong)).toBe(false);
  });
});
