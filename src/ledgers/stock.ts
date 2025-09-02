/**
 * @fileoverview Stock Entry Management System
 * 
 * This module provides a comprehensive type system for managing stock entries in an inventory
 * management system. It supports different types of stock movements including purchases,
 * shrinkage, overage, and sales with proper type safety and validation.
 * 
 * The module uses conditional typing to ensure that type-specific properties are only
 * available when appropriate (e.g., cost information is only required for purchase entries).
 * 
 * Key Features:
 * - Discriminated union types for different stock entry types
 * - Type-safe conditional properties based on entry type
 * - Form and database document type variants
 * - Runtime validation with typia type guards
 * - MongoDB integration support
 * 
 * @example
 * ```typescript
 * // Recording a purchase
 * const purchase: IStockEntry<StockEntryType.Purchase> = {
 *   id: 'entry_123',
 *   date: new Date(),
 *   productId: 'prod_456',
 *   type: StockEntryType.Purchase,
 *   delta: 50n, // Adding 50 units
 *   cost: 1500n, // $15.00 per unit
 *   notes: 'Weekly restock from supplier'
 * };
 * 
 * // Recording shrinkage (no cost required)
 * const shrinkage: IStockEntry<StockEntryType.Shrinkage> = {
 *   id: 'entry_124',
 *   date: new Date(),
 *   productId: 'prod_456',
 *   type: StockEntryType.Shrinkage,
 *   delta: -5n, // Removing 5 units
 *   notes: 'Damaged during transport'
 * };
 * ```
 * 
 * @author Jacques Fourie
 */

import { IProduct } from '../product';
import typia from "typia";
import { keys } from 'ts-transformer-keys';
import { Model, Schema, Document } from 'mongoose';
import { ICoin, IQuantity } from '../common';

/**
 * Enumeration of all possible stock entry types.
 * 
 * This enum defines the different reasons why stock levels might change,
 * each with specific business logic and required properties. The enum values
 * are used as discriminator properties in the type system to ensure type safety.
 * 
 * @enum {string}
 * 
 * @example
 * ```typescript
 * // Using enum values for type discrimination
 * const createStockEntry = (type: StockEntryType, data: any) => {
 *   switch (type) {
 *     case StockEntryType.Purchase:
 *       // TypeScript knows 'cost' property is required
 *       return { ...data, cost: data.cost };
 *     case StockEntryType.Sale:
 *       // No additional properties required
 *       return data;
 *     // ... other cases
 *   }
 * };
 * 
 * // Type-safe entry creation
 * const entry = createStockEntry(StockEntryType.Purchase, {
 *   delta: 100n,
 *   cost: 500n // Required for purchases
 * });
 * ```
 */
export enum StockEntryType {
    /** Stock increase due to purchasing from suppliers - requires cost information */
    Purchase = 'purchase',
    /** Stock decrease due to theft, damage, spoilage, or other losses */
    Shrinkage = 'shrinkage',
    /** Stock increase due to miscount corrections or found inventory */
    Overage = 'overage',
    /** Stock decrease due to customer sales */
    Sale = 'sale',
}

// ****************************
// * Stock Entry Interface *
// ****************************

/**
 * Base properties shared by all stock entry types.
 * 
 * This type defines the common properties that every stock entry must have,
 * regardless of the specific entry type. It provides the foundation for
 * the discriminated union type system.
 * 
 * @private
 */
type StockEntryBase = {
    /** Unique identifier for the stock entry */
    id: string;
    /** Date when the stock change occurred */
    date: Date | string;
    /** Reference to the product that was affected */
    productId: IProduct['id'];
    /** Type of stock entry - determines additional required properties */
    type: StockEntryType;
    /** Change in stock quantity (positive for increase, negative for decrease) */
    delta: IQuantity;
    /** Optional notes explaining the stock change */
    notes?: string;
}

/**
 * Type-specific properties that vary based on the stock entry type.
 * 
 * This mapping defines additional properties that are required for specific
 * types of stock entries. Only purchase entries require additional information
 * (cost), while other entry types have no additional requirements.
 * 
 * @private
 */
type StockTypedProperties = {
    /** Purchase entries require cost information for accounting */
    [StockEntryType.Purchase]: {
        /** Cost per unit at time of purchase */
        cost: ICoin;
    }
    /** Shrinkage entries have no additional properties */
    [StockEntryType.Shrinkage]: {}
    /** Overage entries have no additional properties */
    [StockEntryType.Overage]: {}
    /** Sale entries have no additional properties */
    [StockEntryType.Sale]: {}
}

/**
 * Flexible stock entry type that includes all base properties and optionally any type-specific properties.
 * 
 * This type is used when the stock entry type is unknown or when working with generic
 * stock entries. It includes all base properties and makes type-specific properties
 * optional, allowing for runtime determination of the actual entry type.
 * 
 * @example
 * ```typescript
 * // When processing entries from API without type information
 * const processEntry = (entry: AnyStockEntry) => {
 *   console.log(`Processing entry: ${entry.id}`);
 *   
 *   if (entry.type === StockEntryType.Purchase && entry.cost !== undefined) {
 *     console.log(`Purchase cost: ${entry.cost}`);
 *   }
 * };
 * ```
 */
type AnyStockEntry = StockEntryBase & Partial<StockTypedProperties[StockEntryType.Purchase]>;

/**
 * Main stock entry interface with conditional typing based on entry type.
 * 
 * This is the primary interface for working with stock entries in the system. It uses
 * TypeScript's conditional types to ensure that the correct properties are available
 * based on the stock entry type specified. When no type is specified, it defaults to
 * AnyStockEntry allowing for flexible usage.
 * 
 * @template T The stock entry type or AnyStockEntry if not specified
 * 
 * @example
 * ```typescript
 * // Type-specific stock entries (preferred for type safety)
 * const purchase: IStockEntry<StockEntryType.Purchase> = {
 *   id: 'entry_123',
 *   date: new Date(),
 *   productId: 'prod_456',
 *   type: StockEntryType.Purchase,
 *   delta: 100n, // Adding 100 units
 *   cost: 250n, // $2.50 per unit (required for purchases)
 *   notes: 'Weekly supplier delivery'
 * };
 * 
 * const sale: IStockEntry<StockEntryType.Sale> = {
 *   id: 'entry_124',
 *   date: new Date(),
 *   productId: 'prod_456',
 *   type: StockEntryType.Sale,
 *   delta: -10n, // Removing 10 units
 *   notes: 'Customer purchase'
 *   // No cost property needed for sales
 * };
 * 
 * // Generic entry (when type is unknown)
 * const anyEntry: IStockEntry = {
 *   id: 'entry_125',
 *   date: new Date(),
 *   productId: 'prod_789',
 *   type: StockEntryType.Shrinkage,
 *   delta: -5n
 *   // Additional properties depend on actual type
 * };
 * ```
 */
export type IStockEntry<T = AnyStockEntry> = T extends StockEntryType ? Omit<StockEntryBase, 'type'> & {type: T} & StockTypedProperties[T] : AnyStockEntry;

// *********************************
// * Stock Entry Form Interfaces *
// *********************************

/**
 * Base properties for stock entry forms, excluding auto-generated fields.
 * 
 * This type represents stock entry data as it would be submitted from a form,
 * before processing. It excludes the id field (which is generated) and allows
 * date to be optional (defaulting to current time if not provided).
 * 
 * @private
 */
type StockEntryBaseForm = Omit<StockEntryBase, 'id' | 'date'>;

/**
 * Type-specific properties for stock entry forms.
 * 
 * For forms, the type-specific properties are identical to the main interfaces
 * since no additional transformation is needed between form data and the
 * final entry objects.
 * 
 * @private
 */
type StockTypedPropertiesForm = StockTypedProperties;

/**
 * Flexible form type that includes all base properties and optionally any type-specific properties.
 * 
 * This type is used when the stock entry form type is unknown or when working
 * with generic form data before validation and processing.
 * 
 * @private
 */
type AnyStockEntryForm = StockEntryBaseForm & Partial<StockTypedPropertiesForm[StockEntryType.Purchase]>;

/**
 * Form data interface for creating stock entries with conditional typing.
 * 
 * This interface represents stock entry data as it would be submitted from a form,
 * before validation and processing. It uses the same conditional typing pattern
 * as IStockEntry but excludes auto-generated fields like id and date.
 * 
 * @template T The stock entry type or AnyStockEntryForm if not specified
 * 
 * @example
 * ```typescript
 * // Creating a purchase entry from form data
 * const purchaseForm: IStockEntryForm<StockEntryType.Purchase> = {
 *   productId: 'prod_123',
 *   type: StockEntryType.Purchase,
 *   delta: 50n,
 *   cost: 300n, // Required for purchases
 *   notes: 'Monthly restock'
 * };
 * 
 * // Processing form data
 * const processForm = (form: IStockEntryForm) => {
 *   const entry: IStockEntry = {
 *     ...form,
 *     id: generateId(),
 *     date: new Date()
 *   };
 *   return saveEntry(entry);
 * };
 * 
 * // Type-safe form validation
 * const validatePurchaseForm = (form: unknown): form is IStockEntryForm<StockEntryType.Purchase> => {
 *   return isIStockEntryForm(form, StockEntryType.Purchase);
 * };
 * ```
 */
export type IStockEntryForm<T = AnyStockEntryForm> = T extends StockEntryType ? Omit<StockEntryBaseForm, 'type'> & {type: T} & StockTypedPropertiesForm[T] : AnyStockEntryForm;

// ************************************
// * Stock Entry Document Types *
// ************************************

/**
 * Base interface for stock entry documents in the database.
 * 
 * This interface represents the common properties of stock entries as stored in
 * the database, excluding the id field which is handled by MongoDB as _id.
 * 
 * @private
 */
type IStockEntryDocumentBase = Omit<IStockEntry, 'id'>;

/**
 * Type-specific properties for stock entry documents in database storage format.
 * 
 * This maps stock entry types to their specific properties as they would be stored
 * in the database. String representations are used for certain fields to ensure
 * proper serialization and deserialization with MongoDB.
 * 
 * @private
 */
export type StockTypedPropertiesDocument = {
    /** Purchase-specific properties for database storage */
    [StockEntryType.Purchase]: {
        /** Cost per unit (stored as string for precision) */
        cost: string;
    }
    /** Shrinkage entries have no additional document properties */
    [StockEntryType.Shrinkage]: {}
    /** Overage entries have no additional document properties */
    [StockEntryType.Overage]: {}
    /** Sale entries have no additional document properties */
    [StockEntryType.Sale]: {}
}

/**
 * Flexible document type that includes all base properties and optionally any type-specific properties.
 * 
 * This type is used when the stock entry document type is unknown or when working
 * with generic stock entry documents from the database. It includes MongoDB's
 * Document interface and stores numeric values as strings.
 * 
 * @private
 */
type AnyStockEntryDocument = Omit<IStockEntryDocumentBase, 'delta'> & Document & {
    /** Stock quantity delta stored as string in database */
    delta: string;
} & Partial<StockTypedPropertiesDocument[StockEntryType.Purchase]>;

/**
 * Internal document type for database storage with conditional typing.
 * 
 * This type represents how stock entries are stored in the database, combining
 * the base document properties with type-specific properties. Numeric values
 * are stored as strings to maintain precision and ensure proper serialization.
 * 
 * @template T The stock entry type or AnyStockEntry if not specified
 * @private
 */
type StockEntryDocument<T = AnyStockEntry> = T extends StockEntryType ? Omit<IStockEntryDocumentBase, 'type' | 'delta'> & {type: T} & {delta: string} & StockTypedPropertiesDocument[T] : AnyStockEntryDocument;

/**
 * MongoDB document interface for stock entries with Mongoose integration.
 * 
 * This interface extends the StockEntryDocument type with Mongoose's Document
 * interface, providing database-specific functionality like save(), remove(),
 * and other MongoDB operations. It maintains the same conditional typing
 * pattern for type safety.
 * 
 * @template T The stock entry type or AnyStockEntry if not specified
 * 
 * @example
 * ```typescript
 * // Working with stock entry documents in database operations
 * const findPurchaseEntries = async (productId: string): Promise<IStockEntryDocument<StockEntryType.Purchase>[]> => {
 *   return StockEntryModel.find({ 
 *     productId, 
 *     type: StockEntryType.Purchase 
 *   });
 * };
 * 
 * const updateEntryCost = async (doc: IStockEntryDocument<StockEntryType.Purchase>, newCost: string) => {
 *   doc.cost = newCost;
 *   doc.markModified('cost');
 *   await doc.save();
 * };
 * 
 * // Calculating total stock for a product
 * const calculateStock = async (productId: string): Promise<bigint> => {
 *   const entries = await StockEntryModel.find({ productId });
 *   return entries.reduce((total, entry) => {
 *     return total + BigInt(entry.delta);
 *   }, 0n);
 * };
 * ```
 */
export type IStockEntryDocument<T = AnyStockEntry> = StockEntryDocument<T> & Document;

// ***************
// * Type Guards *
// ***************

/**
 * Type guard to check if an object is a valid IStockEntry.
 * 
 * This function provides runtime type checking for stock entry objects using typia
 * for validation. It can be used in two ways: with or without a specific type
 * parameter to narrow down to a specific stock entry type.
 * 
 * @template T The specific stock entry type to check for
 * @param entry The object to validate
 * @param type Optional specific stock entry type to validate against
 * @returns True if the object is a valid stock entry of the specified type
 * 
 * @example
 * ```typescript
 * // Generic stock entry validation
 * if (isIStockEntry(data)) {
 *   console.log(`Valid entry: ${data.id}`);
 * }
 * 
 * // Type-specific validation
 * if (isIStockEntry(data, StockEntryType.Purchase)) {
 *   console.log(`Purchase cost: ${data.cost}`); // Type-safe access to cost
 * }
 * 
 * // Using in API endpoint validation
 * const processStockEntry = (input: unknown) => {
 *   if (!isIStockEntry(input)) {
 *     throw new Error('Invalid stock entry data');
 *   }
 *   // input is now typed as IStockEntry
 *   return processEntry(input);
 * };
 * ```
 */
export function isIStockEntry<T extends AnyStockEntry = AnyStockEntry>(entry: any): entry is IStockEntry<AnyStockEntry>;
export function isIStockEntry<T extends StockEntryType>(entry: any, type: T): entry is IStockEntry<T>;
export function isIStockEntry<T extends StockEntryType | AnyStockEntry = AnyStockEntry>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntry<T> {
    // Check if the entry is any stock entry
    if (!typia.equals<AnyStockEntry>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntry is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        // If it's a Purchase type, it must have the cost property
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedProperties[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        // For other types, no additional properties are required
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntry<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntry<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntry<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntry<StockEntryType.Sale>>(entry);
    return false;
}

/**
 * Type guard to check if an object is a valid IStockEntryForm.
 * 
 * This function provides runtime type checking for stock entry form objects,
 * typically used when validating form submissions before processing them into
 * full stock entry objects. It uses typia for validation and supports both
 * generic and type-specific validation.
 * 
 * @template T The specific stock entry type to check for
 * @param entry The object to validate as a stock entry form
 * @param type Optional specific stock entry type to validate against
 * @returns True if the object is a valid stock entry form of the specified type
 * 
 * @example
 * ```typescript
 * // Validating form submission
 * const handleFormSubmit = (formData: unknown) => {
 *   if (!isIStockEntryForm(formData)) {
 *     throw new Error('Invalid stock entry form data');
 *   }
 *   // formData is now typed as IStockEntryForm
 *   return convertFormToEntry(formData);
 * };
 * 
 * // Type-specific form validation
 * if (isIStockEntryForm(formData, StockEntryType.Purchase)) {
 *   console.log(`Purchase form with cost: ${formData.cost}`);
 * }
 * 
 * // Validating API input
 * const createStockEntry = (input: unknown) => {
 *   if (!isIStockEntryForm(input, StockEntryType.Sale)) {
 *     return { error: 'Invalid sale entry format' };
 *   }
 *   return processForm(input);
 * };
 * ```
 */
export function isIStockEntryForm<T extends AnyStockEntryForm = AnyStockEntryForm>(entry: any): entry is IStockEntryForm<AnyStockEntryForm>;
export function isIStockEntryForm<T extends StockEntryType>(entry: any, type: T): entry is IStockEntryForm<T>;
export function isIStockEntryForm<T extends StockEntryType | AnyStockEntryForm = AnyStockEntryForm>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntryForm<T> {
    // Check if the entry is any stock entry form
    if (!typia.equals<AnyStockEntryForm>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntryForm is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedPropertiesForm[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntryForm<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntryForm<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntryForm<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntryForm<StockEntryType.Sale>>(entry);
    return false;
}

/**
 * Type guard to check if an object is a valid IStockEntryDocument.
 * 
 * This function provides runtime type checking for stock entry document objects
 * as they would exist in the database. It's primarily used in backend code
 * when working with MongoDB documents and ensuring data integrity.
 * 
 * @template T The specific stock entry type to check for
 * @param entry The object to validate as a stock entry document
 * @param type Optional specific stock entry type to validate against
 * @returns True if the object is a valid stock entry document of the specified type
 * 
 * @example
 * ```typescript
 * // Validating database query results
 * const findAndValidateEntry = async (id: string) => {
 *   const doc = await StockEntryModel.findById(id);
 *   if (!isIStockEntryDocument(doc)) {
 *     throw new Error('Invalid stock entry document from database');
 *   }
 *   return doc;
 * };
 * 
 * // Type-specific validation in database operations
 * const aggregatePurchaseCosts = async (productId: string) => {
 *   const docs = await StockEntryModel.find({ productId });
 *   return docs
 *     .filter(doc => isIStockEntryDocument(doc, StockEntryType.Purchase))
 *     .reduce((total, doc) => total + parseFloat(doc.cost), 0);
 * };
 * 
 * // Pipeline validation
 * const processDatabaseResults = (docs: unknown[]) => {
 *   return docs
 *     .filter(isIStockEntryDocument)
 *     .map(doc => convertDocumentToEntry(doc));
 * };
 * ```
 */
export function isIStockEntryDocument<T extends AnyStockEntryDocument = AnyStockEntryDocument>(entry: any): entry is IStockEntryDocument<AnyStockEntryDocument>;
export function isIStockEntryDocument<T extends StockEntryType>(entry: any, type: T): entry is IStockEntryDocument<T>;
export function isIStockEntryDocument<T extends StockEntryType | AnyStockEntryDocument = AnyStockEntryDocument>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntryDocument<T> {
    // Check if the entry is any stock entry document
    if (!typia.equals<AnyStockEntryDocument>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntryDocument is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedPropertiesDocument[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntryDocument<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntryDocument<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntryDocument<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntryDocument<StockEntryType.Sale>>(entry);
    return false;
}

/**
 * Utility array containing all keys of the IStockEntry interface.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on the IStockEntry interface, useful for dynamic property
 * access, validation, or iteration.
 * 
 * @example
 * ```typescript
 * // Iterating over all stock entry properties
 * keysIStockEntry.forEach(key => {
 *   console.log(`Stock entry has property: ${key}`);
 * });
 * 
 * // Validating object has all required keys
 * const hasAllKeys = keysIStockEntry.every(key => key in entryObject);
 * ```
 */
export const keysIStockEntry = keys<IStockEntry>();

/**
 * Utility array containing all keys specific to purchase stock entries.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on purchase stock entries, including base properties and the
 * purchase-specific cost property.
 * 
 * @example
 * ```typescript
 * // Extracting only purchase entry properties
 * const purchaseData = keysIStockEntryPurchase.reduce((acc, key) => {
 *   if (key in sourceObject) acc[key] = sourceObject[key];
 *   return acc;
 * }, {});
 * ```
 */
export const keysIStockEntryPurchase = [...keys<StockEntryBase>(), 'cost'] as (keyof IStockEntry<StockEntryType.Purchase>)[];

/**
 * Utility array containing all keys specific to shrinkage stock entries.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on shrinkage stock entries (only base properties, no additional ones).
 * 
 * @example
 * ```typescript
 * // Validating shrinkage entry structure
 * const isValidShrinkageEntry = keysIStockEntryShrinkage.every(key => 
 *   key in entryObject && entryObject[key] !== undefined
 * );
 * ```
 */
export const keysIStockEntryShrinkage = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Shrinkage>)[];

/**
 * Utility array containing all keys specific to overage stock entries.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on overage stock entries (only base properties, no additional ones).
 * 
 * @example
 * ```typescript
 * // Creating overage entry from partial data
 * const createOverageEntry = (data: Partial<IStockEntry>) => {
 *   const entry = {} as IStockEntry<StockEntryType.Overage>;
 *   keysIStockEntryOverage.forEach(key => {
 *     if (key in data) entry[key] = data[key];
 *   });
 *   return entry;
 * };
 * ```
 */
export const keysIStockEntryOverage = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Overage>)[];

/**
 * Utility array containing all keys specific to sale stock entries.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on sale stock entries (only base properties, no additional ones).
 * 
 * @example
 * ```typescript
 * // Filtering sale-specific properties from mixed data
 * const extractSaleProperties = (mixedData: Record<string, any>) => {
 *   return keysIStockEntrySale.reduce((acc, key) => {
 *     if (key in mixedData) acc[key] = mixedData[key];
 *     return acc;
 *   }, {} as Partial<IStockEntry<StockEntryType.Sale>>);
 * };
 * ```
 */
export const keysIStockEntrySale = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Sale>)[];
