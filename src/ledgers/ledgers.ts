/**
 * @fileoverview Unified ledger system types and validation functions.
 * 
 * This module provides a unified interface for all ledger-related operations including:
 * - Union types combining all ledger entry types (refills, preorders, stock, transactions)
 * - Form types for creating new ledger entries
 * - Document types for database storage operations
 * - Type guards for runtime validation and type discrimination
 * 
 * The ledger system serves as the central audit trail for all financial and inventory
 * operations within the application, ensuring data consistency and providing a complete
 * record of all business operations.
 * 
 * @author Jacques Fourie
 */

import typia from "typia";
import { IPreOrder, IPreOrderDocument, IPreOrderForm } from "./preorders";
import { IRefill, IRefillDocument, IRefillForm } from "./refill";
import { IStockEntry, IStockEntryDocument, IStockEntryForm } from "./stock";
import { ITransaction, ITransactionDocument, ITransactionForm } from "./transaction";

/**
 * Enumeration of all supported ledger entry types.
 * 
 * Used for type discrimination and categorization of ledger entries.
 * Each enum value corresponds to a specific ledger operation type.
 */
export enum LedgerType {
    Refill = "refill",
    PreOrder = "preOrder",
    Stock = "stock",
    Transaction = "transaction"
}

/**
 * Base interface defining common properties shared by all ledger entries.
 * 
 * This interface establishes the fundamental structure that all ledger
 * entry types must implement, ensuring consistency across the system.
 * 
 * @example
 * ```typescript
 * interface CustomLedgerEntry extends BaseLedgerEntry {
 *   type: LedgerType.CUSTOM;
 *   customField: string;
 * }
 * ```
 */
export interface BaseLedgerEntry {
    /** Unique identifier for the ledger entry */
    id: string;
    /** Timestamp when the entry was created */
    createdAt: Date;
    /** Timestamp when the entry was last updated */
    updatedAt: Date;
    /** Type discriminator for the ledger entry */
    type: LedgerType;
    /** Optional description or notes for the entry */
    description?: string;
}

/**
 * Union type representing all possible ledger entry types.
 * 
 * This type combines all ledger entry interfaces into a single discriminated union,
 * allowing for type-safe handling of any ledger operation. Each ledger type can be
 * distinguished at runtime using the appropriate type guards.
 * 
 * @example
 * ```typescript
 * function processLedgerEntry(entry: ILedger) {
 *   if (isITransaction(entry)) {
 *     // TypeScript knows this is ITransaction
 *     console.log(`Processing transaction: ${entry.reason}`);
 *   } else if (isIRefill(entry)) {
 *     // TypeScript knows this is IRefill
 *     console.log(`Processing refill: ${entry.method}`);
 *   }
 *   // ... handle other types
 * }
 * ```
 */
export type ILedger = IRefill | IPreOrder | IStockEntry | ITransaction;

/**
 * Union type representing all possible ledger form data types.
 * 
 * Used for creating new ledger entries from user input or API requests.
 * Form types exclude system-generated fields like IDs and timestamps.
 * 
 * @example
 * ```typescript
 * function createLedgerEntry(formData: ILedgerForm) {
 *   if (isITransactionForm(formData)) {
 *     return await createTransaction(formData);
 *   } else if (isIRefillForm(formData)) {
 *     return await createRefill(formData);
 *   }
 *   // ... handle other form types
 * }
 * ```
 */
export type ILedgerForm = IRefillForm | IPreOrderForm | IStockEntryForm | ITransactionForm;

/**
 * Union type representing all possible ledger database document types.
 * 
 * Used for database operations and storage. Document types include database-specific
 * fields and exclude client-only properties.
 * 
 * @example
 * ```typescript
 * function saveLedgerDocument(doc: ILedgerDocument) {
 *   // Save to appropriate collection based on document type
 *   if (doc.hasOwnProperty('reason')) {
 *     return await transactionCollection.save(doc as ITransactionDocument);
 *   } else if (doc.hasOwnProperty('method')) {
 *     return await refillCollection.save(doc as IRefillDocument);
 *   }
 *   // ... handle other document types
 * }
 * ```
 */
export type ILedgerDocument = IRefillDocument | IPreOrderDocument | IStockEntryDocument | ITransactionDocument;

/**
 * Type guard function to validate and identify ledger entries at runtime.
 * 
 * Uses typia for efficient runtime type checking and validation.
 * Returns true if the provided value matches any of the ILedger union types.
 * 
 * @param value - The value to validate as a ledger entry
 * @returns True if value is a valid ILedger, false otherwise
 * 
 * @example
 * ```typescript
 * const data = await fetchLedgerData();
 * if (isILedger(data)) {
 *   // TypeScript now knows data is ILedger
 *   processLedgerEntry(data);
 * } else {
 *   throw new Error('Invalid ledger data received');
 * }
 * ```
 */
export const isILedger = typia.createEquals<ILedger>();

/**
 * Type guard function to validate ledger form data at runtime.
 * 
 * Validates that the provided value matches one of the ledger form types,
 * ensuring data integrity before processing form submissions.
 * 
 * @param value - The value to validate as ledger form data
 * @returns True if value is a valid ILedgerForm, false otherwise
 * 
 * @example
 * ```typescript
 * async function handleFormSubmission(formData: unknown) {
 *   if (isILedgerForm(formData)) {
 *     const ledgerEntry = await createLedgerEntry(formData);
 *     return { success: true, entry: ledgerEntry };
 *   } else {
 *     return { success: false, error: 'Invalid form data' };
 *   }
 * }
 * ```
 */
export const isILedgerForm = typia.createEquals<ILedgerForm>();

/**
 * Type guard function to validate ledger database documents at runtime.
 * 
 * Ensures that database documents conform to the expected schema before
 * performing database operations or data transformations.
 * 
 * @param value - The value to validate as a ledger document
 * @returns True if value is a valid ILedgerDocument, false otherwise
 * 
 * @example
 * ```typescript
 * function processDatabaseResult(doc: unknown) {
 *   if (isILedgerDocument(doc)) {
 *     // Safe to perform database operations
 *     return transformDocumentToClientFormat(doc);
 *   } else {
 *     throw new Error('Invalid document structure from database');
 *   }
 * }
 * ```
 */
export const isILedgerDocument = typia.createEquals<ILedgerDocument>();
