/**
 * @fileoverview Shopping cart types and validation functions.
 * 
 * This module provides type definitions for shopping cart functionality including:
 * - Cart items that extend product information with quantity and total
 * - Serialized cart items for HTTP transmission
 * - Full cart collections with validation
 * - Type guards for runtime validation
 * 
 * @author Jacques Fourie
 */

import { ICoin } from "./common";
import { IProduct } from "./product";
import typia, { tags } from "typia";

/**
 * Represents a product in a shopping cart with quantity and calculated total.
 * Extends the base IProduct interface to include cart-specific information.
 */
export interface ICartItem extends IProduct {
    /** Quantity of this product in the cart */
    amount: ICoin
    /** Total cost for this item (price * amount) */
    total: ICoin
}

/**
 * Serialized representation of a cart item for HTTP transmission.
 * Contains only the essential information needed to reconstruct the cart item.
 */
export interface ICartItemSerialized {
    /** Product identifier */
    id: IProduct['id'];
    /** Quantity as string for JSON serialization */
    amount: string;
}

/**
 * Complete shopping cart containing multiple cart items.
 * Represents the full state of a user's shopping session.
 */
export type ICart = ICartItem[];

/**
 * Serialized representation of a complete cart for HTTP transmission.
 * Array of serialized cart items that can be JSON serialized/deserialized.
 */
export type ICartSerialized = ICartItemSerialized[];

// Type guards for runtime validation using typia
/** Validates if an object conforms to ICartItem interface */
export const isICartItem = typia.createEquals<ICartItem>();
/** Validates if an object conforms to ICart interface (array of ICartItem) */
export const isICart = typia.createEquals<ICart>();
/** Validates if an object conforms to ICartSerialized interface */
export const isICartSerialized = typia.createEquals<ICartSerialized>();