/**
 * @fileoverview Test suite for cart module types and validation functions.
 */

import { 
  ICartItem, 
  ICartItemSerialized, 
  ICart, 
  ICartSerialized,
  isICartItem,
  isICart,
  isICartSerialized 
} from './cart';
import { ProductCategories, ProductTypes } from './product';

describe('Cart Module', () => {
  // Test data constants
  const VALID_CART_ITEM: ICartItem = {
    id: 'prod_123',
    category: ProductCategories.Food,
    name: 'Energy Drink',
    description: 'Caffeinated beverage',
    image: 'drink.jpg',
    price: 250n, // $2.50 in cents
    type: ProductTypes.Stock,
    stock: 100n,
    amount: 2n,
    total: 500n, // price * amount
  };

  const VALID_CART_ITEM_SERIALIZED: ICartItemSerialized = {
    id: 'prod_123',
    amount: '2',
  };

  const VALID_CART: ICart = [
    VALID_CART_ITEM,
    {
      ...VALID_CART_ITEM,
      id: 'prod_456',
      name: 'Snack Bar',
      price: 150n,
      amount: 3n,
      total: 450n,
    },
  ];

  const VALID_CART_SERIALIZED: ICartSerialized = [
    VALID_CART_ITEM_SERIALIZED,
    {
      id: 'prod_456',
      amount: '3',
    },
  ];

  describe('isICartItem type guard', () => {
    it('should return true for valid cart item', () => {
      expect(isICartItem(VALID_CART_ITEM)).toBe(true);
    });

    it('should return true for cart item with order type', () => {
      const orderCartItem: ICartItem = {
        ...VALID_CART_ITEM,
        type: ProductTypes.Order,
        order: {
          supplier: 'Test Supplier',
          minimum: 10n,
          current: 5n,
        },
        stock: undefined,
      };
      expect(isICartItem(orderCartItem)).toBe(true);
    });

    it('should return false for missing cart-specific properties', () => {
      const itemWithoutAmount = { ...VALID_CART_ITEM, amount: undefined };
      const itemWithoutTotal = { ...VALID_CART_ITEM, total: undefined };
      
      expect(isICartItem(itemWithoutAmount)).toBe(false);
      expect(isICartItem(itemWithoutTotal)).toBe(false);
    });

    it('should return false for invalid amount types', () => {
      const testCases = [
        { ...VALID_CART_ITEM, amount: '2' },
        { ...VALID_CART_ITEM, amount: 2 },
        { ...VALID_CART_ITEM, amount: null },
      ];

      testCases.forEach((testCase) => {
        expect(isICartItem(testCase)).toBe(false);
      });
    });

    it('should return false for invalid total types', () => {
      const testCases = [
        { ...VALID_CART_ITEM, total: '500' },
        { ...VALID_CART_ITEM, total: 500 },
        { ...VALID_CART_ITEM, total: null },
      ];

      testCases.forEach((testCase) => {
        expect(isICartItem(testCase)).toBe(false);
      });
    });

    it('should return false for invalid product properties', () => {
      const testCases = [
        { ...VALID_CART_ITEM, id: undefined },
        { ...VALID_CART_ITEM, name: undefined },
        { ...VALID_CART_ITEM, category: 'invalid_category' },
        { ...VALID_CART_ITEM, type: 'invalid_type' },
        { ...VALID_CART_ITEM, price: '250' },
      ];

      testCases.forEach((testCase) => {
        expect(isICartItem(testCase)).toBe(false);
      });
    });

    it('should handle zero amounts and totals', () => {
      const zeroItem = { ...VALID_CART_ITEM, amount: 0n, total: 0n };
      expect(isICartItem(zeroItem)).toBe(true);
    });

    it('should handle large BigInt values', () => {
      const largeItem = { 
        ...VALID_CART_ITEM, 
        amount: 999999n, 
        total: 999999n * VALID_CART_ITEM.price 
      };
      expect(isICartItem(largeItem)).toBe(true);
    });
  });

  describe('isICart type guard', () => {
    it('should return true for valid cart (array of cart items)', () => {
      expect(isICart(VALID_CART)).toBe(true);
    });

    it('should return true for empty cart', () => {
      expect(isICart([])).toBe(true);
    });

    it('should return true for single item cart', () => {
      expect(isICart([VALID_CART_ITEM])).toBe(true);
    });

    it('should return false for cart with invalid items', () => {
      const invalidCart = [
        VALID_CART_ITEM,
        { ...VALID_CART_ITEM, amount: undefined }, // Invalid item
      ];
      expect(isICart(invalidCart)).toBe(false);
    });

    it('should return false for non-array values', () => {
      expect(isICart(null)).toBe(false);
      expect(isICart(undefined)).toBe(false);
      expect(isICart('cart')).toBe(false);
      expect(isICart(123)).toBe(false);
      expect(isICart({})).toBe(false);
    });

    it('should return false for arrays containing non-cart-item objects', () => {
      const mixedArray = [VALID_CART_ITEM, 'not a cart item'];
      expect(isICart(mixedArray)).toBe(false);
    });
  });

  describe('isICartSerialized type guard', () => {
    it('should return true for valid serialized cart', () => {
      expect(isICartSerialized(VALID_CART_SERIALIZED)).toBe(true);
    });

    it('should return true for empty serialized cart', () => {
      expect(isICartSerialized([])).toBe(true);
    });

    it('should return true for single serialized item', () => {
      expect(isICartSerialized([VALID_CART_ITEM_SERIALIZED])).toBe(true);
    });

    it('should return false for missing properties in serialized items', () => {
      const invalidSerializedCart = [
        VALID_CART_ITEM_SERIALIZED,
        { id: 'prod_456' }, // Missing amount
      ];
      expect(isICartSerialized(invalidSerializedCart)).toBe(false);
    });

    it('should return false for invalid property types in serialized items', () => {
      const testCases = [
        [{ id: 123, amount: '2' }], // Invalid id type
        [{ id: 'prod_123', amount: 2 }], // Invalid amount type
        [{ id: 'prod_123', amount: null }], // Null amount
      ];

      testCases.forEach((testCase) => {
        expect(isICartSerialized(testCase)).toBe(false);
      });
    });

    it('should return false for extra properties in serialized items', () => {
      const serializedWithExtra = [
        { ...VALID_CART_ITEM_SERIALIZED, extraProp: 'extra' }
      ];
      expect(isICartSerialized(serializedWithExtra)).toBe(false);
    });

    it('should handle string amounts properly', () => {
      const serializedItems = [
        { id: 'prod_1', amount: '0' },
        { id: 'prod_2', amount: '999999' },
        { id: 'prod_3', amount: '1' },
      ];
      expect(isICartSerialized(serializedItems)).toBe(true);
    });
  });

  describe('Type relationships and compatibility', () => {
    it('should ensure ICartItem extends IProduct', () => {
      // This is a compile-time test
      const cartItem: ICartItem = VALID_CART_ITEM;
      
      // Should have all IProduct properties
      expect(cartItem.id).toBeDefined();
      expect(cartItem.category).toBeDefined();
      expect(cartItem.name).toBeDefined();
      expect(cartItem.price).toBeDefined();
      expect(cartItem.type).toBeDefined();
      
      // Should have cart-specific properties
      expect(cartItem.amount).toBeDefined();
      expect(cartItem.total).toBeDefined();
    });

    it('should handle different product types in cart items', () => {
      const stockCartItem: ICartItem = {
        ...VALID_CART_ITEM,
        type: ProductTypes.Stock,
        stock: 50n,
      };

      const orderCartItem: ICartItem = {
        ...VALID_CART_ITEM,
        type: ProductTypes.Order,
        order: {
          supplier: 'Test Supplier',
          minimum: 10n,
          current: 5n,
        },
        stock: undefined,
      };

      expect(isICartItem(stockCartItem)).toBe(true);
      expect(isICartItem(orderCartItem)).toBe(true);
    });

    it('should maintain consistency between ICartItem and ICartItemSerialized', () => {
      expect(VALID_CART_ITEM.id).toBe(VALID_CART_ITEM_SERIALIZED.id);
      expect(VALID_CART_ITEM.amount.toString()).toBe(VALID_CART_ITEM_SERIALIZED.amount);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle zero quantities correctly', () => {
      const zeroCart = [{
        ...VALID_CART_ITEM,
        amount: 0n,
        total: 0n,
      }];
      expect(isICart(zeroCart)).toBe(true);
    });

    it('should handle very large carts', () => {
      const largeCart = Array(1000).fill(VALID_CART_ITEM);
      expect(isICart(largeCart)).toBe(true);
    });

    it('should handle items with minimal required properties', () => {
      const minimalCartItem: ICartItem = {
        id: 'min_prod',
        category: ProductCategories.Other,
        name: 'Minimal Product',
        price: 100n,
        type: ProductTypes.Stock,
        stock: 1n,
        amount: 1n,
        total: 100n,
      };
      expect(isICartItem(minimalCartItem)).toBe(true);
    });
  });
});
