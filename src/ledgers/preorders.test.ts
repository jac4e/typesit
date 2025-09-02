import { IPreOrder, IPreOrderForm, IPreOrderDocument, isIPreOrder, isIPreOrderForm, PreOrderStatus } from './preorders';

describe('isIPreOrder', () => {
    it('should return true for a valid IPreOrder object', () => {
        const preOrder = {
        date: new Date(),
        lastUpdated: new Date(),
        id: '123',
        accountId: '123',
        amount: 100n,
        status: PreOrderStatus.Ordered,
        };
        expect(isIPreOrder(preOrder)).toBe(true);
    });
    it('should return false for an incorrect IPreOrder property', () => {
        const preOrder = {
        date: new Date(),
        lastUpdated: new Date(),
        id: '123',
        accountId: '123',
        amount: 100n,
        status: false,
        };
        expect(isIPreOrder(preOrder)).toBe(false);
    });
    it('should return false when containing an extra property', () => {
        const preOrder = {
        date: new Date(),
        lastUpdated: new Date(),
        id: '123',
        accountId: '123',
        amount: 100n,
        status: PreOrderStatus.Ordered,
        extra: 'property',
        };
        expect(isIPreOrder(preOrder)).toBe(false);
    });
    it('should return false when missing a required property', () => {
        const preOrder = {
        id: '123',
        accountId: '123',
        amount: 100n,
        };
        expect(isIPreOrder(preOrder)).toBe(false);
    });
});

describe('isIPreOrderForm', () => {
    it('should return true for a valid IPreOrderForm object', () => {
        const preOrderForm = {
        accountId: '123',
        amount: 100n,
        status: PreOrderStatus.Ordered,
        };
        expect(isIPreOrderForm(preOrderForm)).toBe(true);
    });
    it('should return false for an incorrect IPreOrderForm property', () => {
        const preOrderForm = {
        accountId: '123',
        amount: 100n,
        status: false,
        };
        expect(isIPreOrderForm(preOrderForm)).toBe(false);
    });
    it('should return false when containing an extra property', () => {
        const preOrderForm = {
        accountId: '123',
        amount: 100n,
        status: PreOrderStatus.Ordered,
        extra: 'property',
        };
        expect(isIPreOrderForm(preOrderForm)).toBe(false);
    });
    it('should return false when missing a required property', () => {
        const preOrderForm = {
        accountId: '123',
        amount: 100n,
        };
        expect(isIPreOrderForm(preOrderForm)).toBe(false);
    });
});