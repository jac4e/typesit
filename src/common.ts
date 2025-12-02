/**
 * @fileoverview Common type definitions and utilities shared across the application.
 * 
 * This module provides fundamental type aliases and transformations used throughout
 * the typeit library, including currency handling, quantity management, and HTTP
 * serialization support.
 * 
 * @author Jacques Fourie
 */

import { ProductTypes } from "./product";
import { IAccountBaseForm, IAccount } from "./account";
import { ITransactionForm } from "./ledgers/transaction";
import { ITransaction } from "./ledgers/transaction";
import { IProductForm } from "./product";
import { IPreOrderForm } from "./ledgers/preorders";
import { IPreOrder } from "./ledgers/preorders";
import { IStockEntryForm } from "./ledgers/stock";
import { IStockEntry } from "./ledgers/stock";
import { ITaskLean } from "./task";
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
export type HTTP<T> = T extends Array<infer U> ? U extends object ? {
    [K in keyof T]: innerHttp<T[K]>;
} : Array<innerHttp<U>> : T extends object ? {
    [K in keyof T]: innerHttp<T[K]>;
} : innerHttp<T>;
type innerHttp<T> = T extends bigint ? string : T extends Date ? string : T extends (bigint | undefined) ? (string | undefined) : T extends Omit<ProductTypedPropertiesDocument["order"], "current"> | undefined ? HTTP<Omit<ProductTypedPropertiesDocument["order"], "current">> | undefined : T;

/**
 * Type guard to check if a value matches the HTTP format (strings, numbers, booleans and nested objects/arrays).
 * @param value The value to check
 * @returns True if the value matches the HTTP format
 */
export function isHTTP<T>(value: unknown): value is HTTP<T> {
    return isHTTPValue(value);
}

function isHTTPValue(value: unknown): boolean {
    // undefined is allowed (optional fields)
    if (value === undefined) return true;
    if (value === null) return false;

    const t = typeof value;
    // primitives allowed in HTTP<T>: string (serialized bigint/date), boolean, number
    if (t === "string" || t === "boolean" || t === "number") return true;

    if (Array.isArray(value)) return value.every(isHTTPValue);

    if (t === "object") {
        return Object.values(value as object).every(isHTTPValue);
    }

    return false;
}

/**
 * Transforms an interface for HTML input elements by converting BigInt and Date types
 * to appropriate HTML input types.
 * 
 * @template T The interface type to transform for HTML inputs
 * 
 * @example
 * ```typescript
 * interface MyData {
 *   id: string;
 *   amount: bigint;
 *   createdAt: Date;
 * }
 * 
 * const htmlInputs: HTML<MyData> = {
 *   id: "text",
 *   amount: "number",
 *   createdAt: "datetime-local"
 * };
 * ```
 */
export type HTML<T> = T extends Array<infer U> ? U extends object ? {
    [K in keyof T]: innerHtml<T[K]>;
} : Array<innerHtml<U>> : T extends object ? {
    [K in keyof T]: innerHtml<T[K]>;
} : innerHtml<T>;

type innerHtml<T> = T extends bigint ? "number"
    : T extends number ? "number"
    : T extends (bigint | undefined) ? "number" 
    : T;