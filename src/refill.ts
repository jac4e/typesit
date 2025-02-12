import { Document } from 'mongoose';
import { keys } from 'ts-transformer-keys';
import typia, { tags } from "typia";

export enum RefillMethods {
  Cash = "cash",
  Etransfer = "etransfer",
  CreditCard = "creditcard",
  DebitCard = "debitcard",
  Stripe = "stripe"
}

export enum RefillStatus {
  Pending = "pending",
  Complete = "complete",
  Failed = "failed",
  Cancelled = "cancelled"
}

export interface IRefill {
  id: string;
  account: string;
  method: RefillMethods;
  reference: string;
  amount: bigint | string; // PHYC amount
  cost: bigint | string; // Amount to charge user
  dateCreated: Date | string;
  dateUpdated: Date | string;
  status: RefillStatus;
  note?: string;
}

export type IRefillDocument = Document & IRefill;

export interface IRefillForm {
  account: IRefill['account'];
  method: IRefill['method'];
  amount: IRefill['amount'];
}

export const isIRefill = typia.createEquals<IRefill>();
export const isIRefillForm = typia.createEquals<IRefillForm>();

export const keysIRefill = keys<IRefill>();
export const keysIRefillForm = keys<IRefillForm>();