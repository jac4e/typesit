/**
 * @fileoverview Pre-order management system for tracking customer orders before minimum quantities are met.
 * 
 * This module handles the pre-order lifecycle for products that require a minimum order quantity
 * from suppliers. Customers can pre-order items, and once enough orders are collected to meet
 * the supplier's minimum, the orders transition from 'ordered' to 'fulfilled' status.
 * 
 * Key Features:
 * - Track customer pre-orders with quantities and status
 * - Manage order lifecycle through distinct status phases
 * - Link pre-orders to specific accounts and products
 * - Support for order cancellation and fulfillment tracking
 * 
 * @author Jacques Fourie
 */

import { Document } from "mongoose";
import { keys } from "ts-transformer-keys";
import typia, { tags } from "typia";
import { IAccount } from "../account";
import { IProduct } from "../product";
import { ICoin } from "../common";
import { BaseLedgerEntry, LedgerType } from "./ledgers";

/**
 * Enumeration of all possible pre-order status values.
 * Represents the lifecycle stages of a pre-order from initial placement to final resolution.
 * 
 * @enum {string}
 * 
 * @example
 * ```typescript
 * // Creating a new pre-order
 * const newPreOrder: IPreOrder = {
 *   // ...other properties
 *   status: PreOrderStatus.Ordered
 * };
 * 
 * // Checking order status
 * if (preOrder.status === PreOrderStatus.Fulfilled) {
 *   console.log('Order has been completed and shipped');
 * }
 * ```
 */
export enum PreOrderStatus {
    /** Initial status when customer places a pre-order */
    Ordered = 'ordered',
    
    /** Order has been fulfilled and shipped to customer */
    Fulfilled = 'fulfilled',
    
    /** Order was cancelled by customer or system */
    Cancelled = 'cancelled',
    
    /** Order was removed or never placed (placeholder status) */
    Unordered = 'unordered'
}

/**
 * Complete pre-order record interface containing all tracking information.
 * 
 * This interface represents a full pre-order entry in the system, extending
 * the base ledger functionality with pre-order specific fields. Pre-orders
 * allow customers to reserve products that require minimum order quantities from
 * suppliers before they can be fulfilled.
 * 
 * @interface IPreOrder
 * 
 * @example
 * ```typescript
 * const preOrder: IPreOrder = {
 *   date: new Date('2023-06-01'),
 *   lastUpdated: new Date('2023-06-02'),
 *   id: 'preorder_12345',
 *   type: LedgerType.PreOrder,
 *   accountId: 'acc_67890',
 *   productId: 'prod_abc123',
 *   amount: 25n, // 25 items
 *   status: PreOrderStatus.Ordered
 * };
 * 
 * // Checking if order meets minimum quantity
 * if (preOrder.amount >= product.order.minimum) {
 *   console.log('Order can be processed');
 * }
 * ```
 */
export interface IPreOrder extends BaseLedgerEntry {
    /** Ledger type identifier for pre-orders */
    type: LedgerType.PreOrder;
    
    /** ID of the customer account that placed this pre-order */
    accountId: IAccount['id'];
    
    /** ID of the product being pre-ordered */
    productId: IProduct['id'];
    
    /** Quantity of items being pre-ordered (in smallest unit) */
    amount: ICoin;
    
    /** Current status of the pre-order in its lifecycle */
    status: PreOrderStatus;
}

/**
 * Form interface for creating new pre-orders.
 * 
 * This type omits system-generated fields (id, createdAt, updatedAt) from the full
 * IPreOrder interface, leaving only the fields that users need to provide when
 * creating a new pre-order. Used in forms and API endpoints for order creation.
 * 
 * @typedef {Object} IPreOrderForm
 * 
 * @example
 * ```typescript
 * // Creating a new pre-order form
 * const orderForm: IPreOrderForm = {
 *   accountId: 'acc_user123',
 *   productId: 'prod_tshirt_xl',
 *   amount: 5n, // Pre-ordering 5 t-shirts
 *   status: PreOrderStatus.Ordered
 * };
 * 
 * // Form would be processed to create full IPreOrder with generated fields
 * const fullOrder: IPreOrder = {
 *   ...orderForm,
 *   id: generateId(),
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 */
export type IPreOrderForm = Omit<IPreOrder, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Database document interface for MongoDB storage.
 * 
 * This type omits the 'id' field from IPreOrder since MongoDB uses '_id' as the
 * primary key. Used for database operations and document serialization.
 * 
 * @typedef {Object} IPreOrderDocument
 */
export type IPreOrderDocument = Omit<IPreOrder, 'id'>;

/**
 * Runtime type guard function for validating IPreOrder objects.
 * 
 * Uses typia to perform compile-time optimized runtime validation of objects
 * against the IPreOrder interface. This ensures type safety when processing
 * data from external sources like APIs or user input.
 * 
 * @function isIPreOrder
 * @param {unknown} obj - Object to validate
 * @returns {boolean} True if object matches IPreOrder interface exactly
 * 
 * @example
 * ```typescript
 * // Validating API response data
 * const apiData = await fetchPreOrder(orderId);
 * 
 * if (isIPreOrder(apiData)) {
 *   // TypeScript now knows apiData is IPreOrder
 *   console.log(`Order ${apiData.id} for ${apiData.amount} items`);
 *   processOrder(apiData);
 * } else {
 *   console.error('Invalid pre-order data received');
 * }
 * ```
 */
export const isIPreOrder = typia.createEquals<IPreOrder>();

/**
 * Runtime type guard function for validating IPreOrderForm objects.
 * 
 * Validates objects against the IPreOrderForm interface, ensuring all required
 * fields for creating a new pre-order are present and correctly typed.
 * 
 * @function isIPreOrderForm
 * @param {unknown} obj - Object to validate
 * @returns {boolean} True if object matches IPreOrderForm interface exactly
 * 
 * @example
 * ```typescript
 * // Validating form submission
 * app.post('/api/preorders', (req, res) => {
 *   if (isIPreOrderForm(req.body)) {
 *     const newOrder = await createPreOrder(req.body);
 *     res.json(newOrder);
 *   } else {
 *     res.status(400).json({ error: 'Invalid order form data' });
 *   }
 * });
 * ```
 */
export const isIPreOrderForm = typia.createEquals<IPreOrderForm>();

/**
 * Compile-time generated array of IPreOrder interface keys in definition order.
 * 
 * This constant provides the exact property names of the IPreOrder interface
 * in the order they are defined. Useful for creating forms, tables, or other
 * UI components that need to iterate over object properties consistently.
 * 
 * @constant {ReadonlyArray<keyof IPreOrder>} keysIPreOrder
 * 
 * @example
 * ```typescript
 * // Creating a dynamic table header
 * const tableHeaders = keysIPreOrder.map(key => ({
 *   field: key,
 *   label: formatLabel(key),
 *   sortable: key !== 'id'
 * }));
 * 
 * // Iterating over order properties
 * keysIPreOrder.forEach(key => {
 *   if (preOrder[key] !== undefined) {
 *     console.log(`${key}: ${preOrder[key]}`);
 *   }
 * });
 * ```
 */
export const keysIPreOrder = keys<IPreOrder>();