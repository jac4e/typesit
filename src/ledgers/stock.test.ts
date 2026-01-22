/**
 * @fileoverview Regression tests for stock ledger entries using BaseLedgerEntry.
 */

import type { IStockEntryDocument } from './stock';
import {
  IStockEntry,
  IStockEntryForm,
  StockEntryType,
  isIStockEntry,
  isIStockEntryForm,
  keysIStockEntry,
  keysIStockEntryPurchase,
  keysIStockEntryShrinkage,
  keysIStockEntryOverage,
  keysIStockEntrySale,
} from './stock';
import { LedgerType } from './ledgers';

describe('IStockEntry', () => {
  const createdAt = new Date('2024-02-01T09:00:00.000Z');
  const updatedAt = new Date('2024-02-01T09:05:00.000Z');

  const PURCHASE_ENTRY: IStockEntry<StockEntryType.Purchase> = {
    id: 'stock_purchase_001',
    type: LedgerType.Stock,
    createdAt,
    updatedAt,
    description: 'Supplier delivery',
    entryType: StockEntryType.Purchase,
    productId: 'prod-001',
    delta: 25n,
    cost: 1250n,
  };

  const SHRINKAGE_ENTRY: IStockEntry<StockEntryType.Shrinkage> = {
    id: 'stock_shrinkage_001',
    type: LedgerType.Stock,
    createdAt,
    updatedAt,
    entryType: StockEntryType.Shrinkage,
    productId: 'prod-001',
    delta: -2n,
  };

  const OVERAGE_ENTRY: IStockEntry<StockEntryType.Overage> = {
    id: 'stock_overage_001',
    type: LedgerType.Stock,
    createdAt,
    updatedAt,
    entryType: StockEntryType.Overage,
    productId: 'prod-001',
    delta: 3n,
  };

  const SALE_ENTRY: IStockEntry<StockEntryType.Sale> = {
    id: 'stock_sale_001',
    type: LedgerType.Stock,
    createdAt,
    updatedAt,
    entryType: StockEntryType.Sale,
    productId: 'prod-002',
    delta: -5n,
  };

  it('accepts purchase entries with cost', () => {
    expect(isIStockEntry(PURCHASE_ENTRY)).toBe(true);
    expect(isIStockEntry(PURCHASE_ENTRY, StockEntryType.Purchase)).toBe(true);
  });

  it('requires cost for purchase entries', () => {
    const withoutCost = { ...PURCHASE_ENTRY };
    delete (withoutCost as Partial<typeof withoutCost>).cost;
    expect(isIStockEntry(withoutCost)).toBe(false);
  });

  it('accepts shrinkage entries without purchase-only fields', () => {
    expect(isIStockEntry(SHRINKAGE_ENTRY)).toBe(true);
    expect(isIStockEntry(SHRINKAGE_ENTRY, StockEntryType.Shrinkage)).toBe(true);
  });

  it('validates overage and sale entries through the typed guard', () => {
    expect(isIStockEntry(OVERAGE_ENTRY, StockEntryType.Overage)).toBe(true);
    expect(isIStockEntry(SALE_ENTRY, StockEntryType.Sale)).toBe(true);
  });

  it('returns false when the requested entry type does not match', () => {
    expect(isIStockEntry(OVERAGE_ENTRY, StockEntryType.Purchase)).toBe(false);
    expect(isIStockEntry(SALE_ENTRY, 'invalid' as any)).toBe(false);
  });

  it('rejects entries when the ledger type discriminant is incorrect', () => {
    const wrongLedgerType = { ...SHRINKAGE_ENTRY, type: LedgerType.Transaction };
    expect(isIStockEntry(wrongLedgerType)).toBe(false);
  });

  it('reports key arrays including the BaseLedgerEntry metadata', () => {
    const baseKeys = ['id', 'createdAt', 'updatedAt', 'type', 'description', 'entryType', 'productId', 'delta'] as const;

    expect(keysIStockEntryPurchase).toHaveLength(baseKeys.length + 1);
    expect(new Set(keysIStockEntry)).toEqual(new Set([...baseKeys, 'cost']));
    expect(keysIStockEntryPurchase).toEqual([...baseKeys, 'cost']);
    expect(new Set(keysIStockEntryShrinkage)).toEqual(new Set(baseKeys));
    expect(new Set(keysIStockEntryOverage)).toEqual(new Set(baseKeys));
    expect(new Set(keysIStockEntrySale)).toEqual(new Set(baseKeys));
  });
});

describe('IStockEntryForm', () => {
  const PURCHASE_FORM: IStockEntryForm<StockEntryType.Purchase> = {
    entryType: StockEntryType.Purchase,
    productId: 'prod-001',
    delta: 10n,
    cost: 500n,
  };

  const SALE_FORM: IStockEntryForm<StockEntryType.Sale> = {
    entryType: StockEntryType.Sale,
    productId: 'prod-001',
    delta: -4n,
  };

  const OVERAGE_FORM: IStockEntryForm<StockEntryType.Overage> = {
    entryType: StockEntryType.Overage,
    productId: 'prod-001',
    delta: 2n,
  };

  it('validates purchase forms with cost', () => {
    expect(isIStockEntryForm(PURCHASE_FORM)).toBe(true);
    expect(isIStockEntryForm(PURCHASE_FORM, StockEntryType.Purchase)).toBe(true);
  });

  it('rejects purchase forms without cost', () => {
    const missingCost = { ...PURCHASE_FORM };
    delete (missingCost as Partial<typeof missingCost>).cost;
    expect(isIStockEntryForm(missingCost)).toBe(false);
  });

  it('validates sale forms without purchase-only fields', () => {
    expect(isIStockEntryForm(SALE_FORM)).toBe(true);
    expect(isIStockEntryForm(SALE_FORM, StockEntryType.Sale)).toBe(true);
  });

  it('validates overage forms and rejects unsupported discriminators', () => {
    expect(isIStockEntryForm(OVERAGE_FORM)).toBe(true);
    expect(isIStockEntryForm(OVERAGE_FORM, StockEntryType.Overage)).toBe(true);
    expect(isIStockEntryForm(OVERAGE_FORM, 'invalid' as any)).toBe(false);
  });
});

describe('IStockEntryDocument', () => {
  const baseDocument = {
    type: LedgerType.Stock,
    createdAt: new Date('2024-02-02T10:00:00.000Z'),
    updatedAt: new Date('2024-02-02T10:05:00.000Z'),
    entryType: StockEntryType.Purchase,
    productId: 'prod-010',
    delta: '12',
    cost: '2400',
  } as unknown as IStockEntryDocument<StockEntryType.Purchase>;

  it('returns false for documents that fail typia validation or use invalid discriminators', async () => {
    jest.resetModules();
    jest.unmock('typia');
    const { isIStockEntryDocument: realIsDoc } = await import('./stock');

    expect(realIsDoc(baseDocument)).toBe(false);
    expect(realIsDoc(baseDocument, 'invalid' as any)).toBe(false);
  });
});
