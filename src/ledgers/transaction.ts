import { Document } from 'mongoose';
import typia, { tags } from "typia";
import { keys } from 'ts-transformer-keys';
import { ICartItem } from '../cart';
import { ICoin } from '../common';

export enum TransactionType {
    Debit = 'debit',
    Credit = 'credit'
}

export interface ITransactionItem {
    name: ICartItem['name'];
    description?: ICartItem['description'];
    price: string;
    amount: string;
    total: string;
}

export interface ITransaction {
    date: Date | string;
    id: string;
    accountId: string;
    type: TransactionType;
    reason: string;
    products: ITransactionItem[];
    total: ICoin
}

export type ITransactionForm = Omit<ITransaction, 'id' | 'date' | 'total'> & {
    total: string;
};

export type ITransactionDocument = Omit<ITransaction, 'id' | 'total'> & {
    total: string;
};

export const isITransaction = typia.createEquals<ITransaction>();
export const isITransactionForm = typia.createEquals<ITransactionForm>();

export const keysITransaction = keys<ITransaction>();
