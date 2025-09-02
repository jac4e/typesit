/**
 * @fileoverview Statistics and analytics type definitions.
 * 
 * This module provides comprehensive type definitions for various statistics and metrics
 * used throughout the application for reporting, analytics, and business intelligence.
 * Includes financial metrics, inventory tracking, user analytics, and sales reporting.
 * 
 * @author Jacques Fourie
 */

import { Roles } from "./account.js";
import { RefillStatus } from "./ledgers/refill.js";
import { TransactionType } from "./ledgers/transaction.js";

/**
 * Enumeration of available date range filters for statistical queries.
 * Used to specify the time period for generating statistics and reports.
 */
export enum StatsDateRange {
    /** All available data regardless of date */
    All = 'all',
    /** Last 24 hours */
    Day = '1d',
    /** Last 7 days */
    Week = '1w',
    /** Last 30 days */
    Month = '1m',
    /** Last 90 days */
    Quarter = '3m',
    /** Last 365 days */
    Year = '1y',
}

/**
 * Financial statistics and metrics for business reporting.
 * Provides key financial indicators for revenue tracking and profitability analysis.
 */
export interface IFinanceStats {
    /** Total credit/money loaded into the system by users */
    totalCredit: number;
    /** Total revenue generated from sales */
    revenue: number;
    /** Current credit balance held by all users combined */
    creditBalance: number;
    /** Total cost of goods sold during the period */
    costOfGoodsSold: number;
    /** Net profit (revenue - cost of goods sold) */
    profit: number;
}

/**
 * Inventory statistics for stock management and planning.
 * Tracks product availability and inventory valuation.
 */
export interface IInventoryStats {
    /** Total number of unique products in catalog */
    total: number;
    /** Number of products currently in stock */
    inStock: number;
    /** Number of products currently out of stock */
    outOfStock: number;
    /** Total book value (cost) of current inventory */
    bookValue: number;
    /** Total retail value (selling price) of current inventory */
    retailValue: number;
}

/**
 * Transaction statistics broken down by transaction type.
 * Provides counts of different transaction types with totals.
 */
export type ITransactionStats = Record<TransactionType, number> & {
    /** Total count of all transactions */
    total: number;
};

/**
 * Account statistics broken down by user role.
 * Tracks user distribution across different permission levels.
 */
export type IAccountStats = Record<Roles, number> & {
    /** Total count of all user accounts */
    total: number;
};

/**
 * Refill statistics broken down by status.
 * Tracks the status distribution of account refill operations.
 */
export type IRefillStats = Record<RefillStatus, number> & {
    /** Total count of all refill attempts */
    total: number;
};

/**
 * Store performance statistics and rankings.
 * Provides insights into best-selling products and top customers.
 */
export interface IStoreStats {
    /** Products ranked by sales volume (highest to lowest) */
    rankedProducts: {
        /** Product name */
        name: string;
        /** Total quantity sold */
        amountSold: number;
        /** Current selling price */
        price: number;
    }[];
    /** Customers ranked by spending amount (highest to lowest) */
    rankedBuyers: {
        /** User account identifier */
        id: string;
        /** User's display name/username */
        username: string;
        /** Total amount spent by this user */
        amountSpent: number;
    }[];
}