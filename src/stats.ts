import { Roles } from "./account.js";
import { RefillStatus } from "./refill.js";
import { TransactionType } from "./transaction.js";

export enum StatsDateRange {
    All = 'all',
    Day = '1d',
    Week = '1w',
    Month = '1m',
    Quarter = '3m',
    Year = '1y',
}

export interface IFinanceStats {
    totalCredit: number;
    revenue: number;
    creditBalance: number;
    costOfGoodsSold: number;
    profit: number;
}

export interface IInventoryStats {
    total: number;
    inStock: number;
    outOfStock: number;
    bookValue: number;
    retailValue: number;
}

export type ITransactionStats = Record<TransactionType, number> & {total: number};

export type IAccountStats = Record<Roles, number> & {total: number};

export type IRefillStats = Record<RefillStatus, number> & {total: number};

export interface IStoreStats {
    rankedProducts: {
        name: string;
        amountSold: number;
        price: number;
    }[];
    rankedBuyers: {
        id: string;
        username: string;
        amountSpent: number;
    }[];
}