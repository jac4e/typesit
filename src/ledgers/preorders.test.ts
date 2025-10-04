import { IPreOrder, IPreOrderForm, isIPreOrder, isIPreOrderForm, PreOrderStatus } from './preorders';
import { LedgerType } from './ledgers';

describe('IPreOrder', () => {
  const createdAt = new Date('2024-04-01T10:00:00.000Z');
  const updatedAt = new Date('2024-04-01T12:00:00.000Z');

  const VALID_PREORDER: IPreOrder = {
    id: 'preorder-1',
    type: LedgerType.PreOrder,
    createdAt,
    updatedAt,
    accountId: 'account-1',
    productId: 'product-1',
    amount: 10n,
    status: PreOrderStatus.Ordered,
  };

  it('accepts a full preorder ledger entry', () => {
    expect(isIPreOrder(VALID_PREORDER)).toBe(true);
  });

  it('rejects payloads missing base ledger metadata', () => {
    const missingLedgerType = { ...VALID_PREORDER, type: LedgerType.Refill };
    const missingCreatedAt = { ...VALID_PREORDER, createdAt: undefined } as unknown;

    expect(isIPreOrder(missingLedgerType)).toBe(false);
    expect(isIPreOrder(missingCreatedAt)).toBe(false);
  });

  it('rejects invalid preorder specific properties', () => {
    const invalidStatus = { ...VALID_PREORDER, status: 'unknown' } as unknown;
    const invalidAmount = { ...VALID_PREORDER, amount: '5' } as unknown;

    expect(isIPreOrder(invalidStatus)).toBe(false);
    expect(isIPreOrder(invalidAmount)).toBe(false);
  });
});

describe('IPreOrderForm', () => {
  const VALID_FORM: IPreOrderForm = {
    type: LedgerType.PreOrder,
    accountId: 'account-1',
    productId: 'product-1',
    amount: 10n,
    status: PreOrderStatus.Ordered,
  };

  it('accepts preorder form payloads without ledger metadata', () => {
    expect(isIPreOrderForm(VALID_FORM)).toBe(true);
  });

  it('rejects forms that include ledger fields', () => {
    const withCreatedAt = { ...VALID_FORM, createdAt: new Date() } as unknown;
    expect(isIPreOrderForm(withCreatedAt)).toBe(false);
  });
});
