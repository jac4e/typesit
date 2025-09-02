/**
 * @fileoverview Common type definitions and utilities shared across the application.
 * 
 * This module provides fundamental type aliases and transformations used throughout
 * the typeit library, including currency handling, quantity management, and HTTP
 * serialization support.
 * 
 * @author Jacques Fourie
 */

import { IProduct, ProductTypedPropertiesDocument } from "./product";

/**
 * Represents monetary values in the smallest currency unit (e.g., cents).
 * Uses BigInt to handle large values precisely without floating-point errors.
 * 
 * @example
 * ```typescript
 * const price: ICoin = 1050n; // Represents $10.50 in cents
 * const balance: ICoin = 0n;   // Zero balance
 * ```
 */
export type ICoin = bigint;

/**
 * Represents quantities of items or products.
 * Uses BigInt to handle large inventory quantities without precision loss.
 * 
 * @example
 * ```typescript
 * const stockLevel: IQuantity = 500n; // 500 items in stock
 * const orderAmount: IQuantity = 25n; // Order quantity of 25
 * ```
 */
export type IQuantity = bigint;

/**
 * Transforms an interface for HTTP transmission by converting BigInt and Date types to strings.
 * This type utility ensures all BigInt values become string representations and all Date
 * objects become ISO string representations, making the data JSON-serializable for HTTP APIs.
 * 
 * @template T The interface type to transform for HTTP transmission
 * 
 * @example
 * ```typescript
 * interface MyData {
 *   id: string;
 *   amount: bigint;
 *   createdAt: Date;
 *   count?: bigint;
 * }
 * 
 * const httpData: HTTP<MyData> = {
 *   id: "123",
 *   amount: "1000",     // bigint → string
 *   createdAt: "2023-01-01T00:00:00.000Z", // Date → string
 *   count: "5"          // optional bigint → optional string
 * };
 * ```
 */
// HTTP<T> type should replace all bigint types on the T interface with BigIntHTTP and all Date types with DateHTTP
export type HTTP<T> = {
    [K in keyof T]: T[K] extends bigint ? string : T[K] extends Date ? string : T[K] extends (bigint | undefined) ? (string | undefined) :  T[K] extends Omit<ProductTypedPropertiesDocument["order"],"current"> | undefined ? HTTP<Omit<ProductTypedPropertiesDocument["order"],"current">> | undefined : T[K];
};
