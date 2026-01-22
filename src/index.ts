/**
 * @fileoverview Main entry point for the typeit library - A comprehensive TypeScript library
 * providing shared types, interfaces, and utilities for spendit and serveit applications.
 * 
 * This library includes type definitions and validation functions for:
 * - User accounts and authentication
 * - Product management with stock and order variants
 * - Shopping cart functionality  
 * - Transaction and ledger entries
 * - Financial and inventory statistics
 * - Background task management
 * 
 * @author Jacques Fourie
 * @version 1.0.0
 * @license AGPL-3.0
 */

import { keys } from 'ts-transformer-keys';
import { IAccount, IAccountBaseForm, IAccountDocument, isIAccount, keysIAccount } from './account.js';
import { IApiKey, IApiKeyCreateForm, IApiKeyDocument, isIApiKey, keysIApiKey } from './api-key.js';
import { IProduct, IProductDocument, IProductForm, ProductTypes, isIProduct, keysIProduct, keysIProductOrder, keysIProductStock } from './product.js';
import { isITransaction, ITransaction, ITransactionDocument, ITransactionForm, keysITransaction } from './ledgers/transaction.js';
import { IPreOrder, IPreOrderDocument, IPreOrderForm, isIPreOrder, keysIPreOrder } from './ledgers/preorders.js';
import { IStockEntry, IStockEntryDocument, IStockEntryForm, isIStockEntry, keysIStockEntry } from './ledgers/stock.js';
import { isIRefill, keysIRefill } from './ledgers/refill.js';
import { isILedger } from './ledgers/ledgers.js';

export * from './account.js';
export * from './api-key.js';
// export { IAccount, ICredentials, IAccountDocument, IAccountForm, Roles, isIAccount, isIAccountForm, isICredentials } from './account.js';
export * from './cart.js';
// export { ICartItem, ICartItemSerialized, ICart, ICartSerialized, isICartItem, isICart, isICartSerialized } from './cart.js';
export * from './common.js';
// export { ICoin, IQuantity, HTTP } from './common.js';
export * from './log.js';
export * from './product.js';
// export { IProduct, ProductCategories, ProductTypes, isIProduct } from './product.js';
export * from './ledgers/preorders.js';
// export { IPreOrder, PreOrderStatus, isIPreOrder } from './preorders.js';
export * from './ledgers/stock.js';
// export { IStockEntry, StockEntryType, isIStockEntry } from './stock.js';
export * from './ledgers/transaction.js';
export { ITransaction, TransactionType, ITransactionForm, ITransactionItem, ITransactionDocument, isITransaction, isITransactionForm } from './ledgers/transaction.js';
export * from './ledgers/refill.js';
export * from './ledgers/ledgers.js';
export * from './stats.js';
export * from './task.js';

/**
 * Union type of all available object types that can be processed by utility functions
 */
export type AvailableTypes = IAccount | IApiKey | ITransaction | IProduct | IProduct<ProductTypes.Stock> | IProduct<ProductTypes.Order> | IPreOrder | IStockEntry;

/**
 * Type that converts given interface types to their corresponding Mongoose document types
 * @template Type The interface type to convert
 */
export type MongooseDocumentType<Type> = Type extends IAccount ? IAccountDocument :
    Type extends IApiKey ? IApiKeyDocument :
    Type extends ITransaction ? ITransactionDocument :
    Type extends IProduct ? IProductDocument :
    Type extends IProduct<ProductTypes.Stock> ? IProductDocument<ProductTypes.Stock> :
    Type extends IProduct<ProductTypes.Order> ? IProductDocument<ProductTypes.Order> :
    Type extends IPreOrder ? IPreOrderDocument :
    Type extends IStockEntry ? IStockEntryDocument :
    never;

/**
 * Type to transform ITypes to their corresponding ITypeForm types.
 * 
 */
export type FormType<T> = T extends IAccount ? IAccountBaseForm : T extends IApiKey ? IApiKeyCreateForm : T extends ITransaction ? ITransactionForm : T extends IProduct ? IProductForm : T extends IProduct<ProductTypes.Stock> ? IProductForm<ProductTypes.Stock> : T extends IProduct<ProductTypes.Order> ? IProductForm<ProductTypes.Order> : T extends IPreOrder ? IPreOrderForm : T extends IStockEntry ? IStockEntryForm : never;

/**
 * Extracts all possible keys from a union type as a union of key types
 * @template Type The union type to extract keys from
 */
export type UnionKeys<Type> = Type extends Type ? keyof Type: never;

/**
 * Extracts all possible values from a union type as a union of value types  
 * @template Type The union type to extract values from
 */
export type UnionValues<Type> = Type extends Type ? Type[keyof Type]: never;

/**
 * Creates a union of objects containing key-value pairs from a union type
 * @template Type The union type to extract key-value pairs from
 */
export type UnionKeysValues<Type> = Type extends Type ? {key: UnionKeys<Type>, value: UnionValues<Type>}: never;

// Useful functions to ensure order of keys/values for interfaces match their interface definition

/**
 * Returns an array of object keys in the order they are defined in the interface.
 * This function provides type-safe key extraction that maintains the original 
 * interface definition order, which is crucial for enumeration consistency.
 * 
 * @template Type The type of the object to extract keys from
 * @param obj The object to extract keys from
 * @returns Array of keys in interface definition order
 * 
 * @example
 * ```typescript
 * const account: IAccount = { id: '1', username: 'user', ... };
 * const keys = getKeys(account); // ['id', 'gid', 'username', ...]
 * ```
 */
export function getKeys<Type>(obj: Type) {
    if (isIAccount(obj)) {
        return keysIAccount as (UnionKeys<Type>)[];
    } else if (isIApiKey(obj)) {
        return keysIApiKey as (UnionKeys<Type>)[];
    } else if (isITransaction(obj)) {
        return keysITransaction as (UnionKeys<Type>)[];
    } else if (isIProduct(obj, ProductTypes.Order)) {
        return keysIProductOrder as (UnionKeys<Type>)[];
    } else if (isIProduct(obj, ProductTypes.Stock)) {
        return keysIProductStock as (UnionKeys<Type>)[];
    } else if (isIProduct(obj)) {
        return keysIProduct as (UnionKeys<Type>)[];  
    } else if (isIPreOrder(obj)) {
        return keysIPreOrder as (UnionKeys<Type>)[];
    } else if (isIStockEntry(obj)) {
        return keysIStockEntry as (UnionKeys<Type>)[];
    } else if (isIRefill(obj)) {
        return keysIRefill as (UnionKeys<Type>)[];
    } else {
        return [];
    }
}

/**
 * Returns an array of object values in the order they are defined in the interface.
 * This function provides type-safe value extraction that maintains the original
 * interface definition order, matching the order of keys returned by getKeys().
 * 
 * @template Type The type of the object to extract values from  
 * @param obj The object to extract values from
 * @returns Array of values in interface definition order
 * 
 * @example
 * ```typescript
 * const account: IAccount = { id: '1', username: 'user', ... };
 * const values = getValues(account); // ['1', undefined, 'user', ...]
 * ```
 */
export function getValues<Type>(obj: Type) {
    if (isIAccount(obj)) {
        return [
            obj.id,
            obj.gid,
            obj.username,
            obj.firstName,
            obj.lastName,
            obj.email,
            obj.role,
            obj.balance,
            obj.notify
        ] as (UnionValues<Type>)[];
    } else if (isITransaction(obj)) {
        return [
            obj.id,
            obj.type,
            obj.createdAt,
            obj.updatedAt,
            obj.description,
            obj.id,
            obj.accountId,
            obj.type,
            obj.products,
            obj.total
        ] as (UnionValues<Type>)[];
    } else if (isIProduct(obj)) {
        return [
            obj.id,
            obj.category,
            obj.name,
            obj.description,
            obj.image,
            obj.price,
            obj.type,
            obj.order ? obj.order : (obj.stock ? obj.stock : undefined)
        ] as (UnionValues<Type>)[];
    } else if (isIPreOrder(obj)) {
        return [
            obj.id,
            obj.type,
            obj.createdAt,
            obj.updatedAt,
            obj.description,
            obj.accountId,
            obj.productId,
            obj.amount,
            obj.status,
        ] as (UnionValues<Type>)[];
    } else if (isIStockEntry(obj)) {
        const values: unknown[] = [
            obj.id,
            obj.createdAt,
            obj.updatedAt,
            obj.type,
            obj.description,
            obj.entryType,
            obj.productId,
            obj.delta,
        ];

        if ('cost' in obj) {
            values.push(obj.cost);
        }

        return values as (UnionValues<Type>)[];
    } else if (isIRefill(obj)) {
        return [
            obj.id,
            obj.account,
            obj.method,
            obj.reference,
            obj.amount,
            obj.cost,
            obj.createdAt,
            obj.updatedAt,
            obj.status,
        ] as (UnionValues<Type>)[];
    } else {
        return [];
    }
}

/**
 * Creates an array of key-value pair objects from the given object.
 * Combines the results of getKeys() and getValues() to provide a structured
 * representation of the object's properties in interface definition order.
 * 
 * @template Type The type extending AvailableTypes to create objects from
 * @param item The object to convert to key-value pairs
 * @returns Array of objects containing key and value properties
 * 
 * @example
 * ```typescript
 * const account: IAccount = { id: '1', username: 'user', ... };
 * const objects = getObject(account); 
 * // [{ key: 'id', value: '1' }, { key: 'gid', value: undefined }, ...]
 * ```
 */
export function getObject<Type extends AvailableTypes>(item: Type): {key: keyof Type; value: Type[keyof Type]}[] {
    const returnArray = [] as {key: keyof Type; value: Type[keyof Type]}[];
    const keys = getKeys(item);
    const values = getValues(item);

    for (let index = 0; index < keys.length; index++) {
        returnArray.push({key: keys[index], value: values[index]});
    }

    return returnArray;
}

/**
 * Configures BigInt serialization for JSON.stringify().
 * This extends the BigInt prototype to include a toJSON method that converts
 * BigInt values to strings during JSON serialization, solving compatibility
 * issues with JSON processing that doesn't natively support BigInt.
 * 
 * @see {@link https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1721402063}
 * 
 * @example
 * ```typescript
 * const data = { amount: 100n };
 * JSON.stringify(data); // '{"amount":"100"}'
 * ```
 */
// Hijack bigint for json serialization because the spec writers hate me
// Had to update using method found here https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1721402063
// as previous method (BigInt.prototype.toJSON = function() { return this.toString(); }) was not working anymore
Object.defineProperty(BigInt.prototype, "toJSON", {
    get() {
        "use strict";
        return () => String(this);
    }
});
