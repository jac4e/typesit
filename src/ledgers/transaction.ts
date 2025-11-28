/**
 * @fileoverview Transaction ledger types and validation functions.
 * 
 * This module provides comprehensive type definitions for financial transactions including:
 * - Transaction types for debits and credits
 * - Transaction items representing individual products or services
 * - Form interfaces for creating new transactions
 * - Document types for database storage
 * - Type guards for runtime validation
 * 
 * Transactions form the core of the financial tracking system, recording all
 * account balance changes, purchases, refills, and refunds.
 * 
 * @author Jacques Fourie
 */

import { Document } from 'mongoose';
import typia, { tags } from "typia";
import { keys } from 'ts-transformer-keys';
import { ICartItem } from '../cart';
import { ICoin } from '../common';
import { BaseLedgerEntry, LedgerType } from './ledgers';

/**
 * Enumeration of transaction types for financial record keeping.
 * Determines the direction of money flow for the transaction.
 */
export enum TransactionType {
    /** Money removed from account (purchases, fees, withdrawals) */
    Debit = 'debit',
    /** Money added to account (refills, refunds, credits) */
    Credit = 'credit'
}

/**
 * Represents an individual item or service within a transaction.
 * Provides detailed breakdown of transaction components with pricing information.
 */
export interface ITransactionItem {
    /** Product or service name */
    name: ICartItem['name'];
    /** Optional detailed description of the item */
    description?: ICartItem['description'];
    /** Unit price as string for precise decimal representation */
    price: string;
    /** Quantity purchased as string for precise decimal representation */
    amount: string;
    /** Total cost for this item (price × amount) as string */
    total: string;
}

/**
 * Complete transaction record representing a financial operation.
 * Contains all information needed for accounting, auditing, and reporting.
 */
export interface ITransaction extends BaseLedgerEntry {
    /** Ledger discriminator for financial transactions */
    type: LedgerType.Transaction;
    /** Account ID that this transaction affects */
    accountId: string;
    /** Type of transaction (debit or credit) */
    transactionType: TransactionType;
    /** Array of items/services included in this transaction */
    products: ITransactionItem[];
    /** Total transaction amount in smallest currency unit */
    total: ICoin
}

/**
 * Form data for creating a new transaction.
 * Excludes system-generated fields like ID and timestamp.
 */
export type ITransactionForm = Omit<ITransaction, 'id' | 'createdAt' | 'updatedAt' | 'total'> & {
    /** Total amount as string for form input validation */
    total: string;
};

/**
 * MongoDB document type for transaction storage.
 * Stores transaction total as string for precise decimal handling in database.
 */
export type ITransactionDocument = Omit<ITransaction, 'id' | 'total'> & Document & {
    /** Total amount stored as string in database */
    total: string;
};

// Type guards for runtime validation using typia
/** 
 * Validates if an object conforms to ITransaction interface
 * @function
 */
export const isITransaction = typia.createEquals<ITransaction>();
/** 
 * Validates if an object conforms to ITransactionForm interface
 * @function
 */
export const isITransactionForm = typia.createEquals<ITransactionForm>();

/** Array of ITransaction keys in interface definition order */
export const keysITransaction = keys<ITransaction>();
