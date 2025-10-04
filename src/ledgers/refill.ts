/**
 * @fileoverview Account refill management types and validation functions.
 * 
 * This module provides comprehensive type definitions for account refill operations including:
 * - Payment method definitions for various refill options
 * - Refill status tracking through the processing lifecycle
 * - Form interfaces for initiating refill requests
 * - Document types for database storage
 * - Type guards for runtime validation
 * 
 * @author Jacques Fourie
 */

import { Document } from 'mongoose';
import { keys } from 'ts-transformer-keys';
import typia, { tags } from "typia";
import { BaseLedgerEntry, LedgerType } from "./ledgers";

/**
 * Enumeration of supported payment methods for account refills.
 * Each method may have different processing requirements and fees.
 */
export enum RefillMethods {
  /** Cash payment processed in person */
  Cash = "cash",
  /** Electronic transfer (e-transfer) payment */
  Etransfer = "etransfer",
  /** Credit card payment */
  CreditCard = "creditCard",
  /** Debit card payment */
  DebitCard = "debitCard",
  /** Stripe payment processing platform */
  Stripe = "stripe"
}

/**
 * Enumeration of refill processing statuses.
 * Tracks the lifecycle of refill requests from initiation to completion.
 */
export enum RefillStatus {
  /** Refill initiated but not yet processed */
  Pending = "pending",
  /** Refill successfully processed and credited to account */
  Complete = "complete",
  /** Refill processing failed (payment declined, technical error, etc.) */
  Failed = "failed",
  /** Refill cancelled by user or system before completion */
  Cancelled = "cancelled"
}

/**
 * Complete refill record representing a processed or in-progress refill operation.
 * Contains all information needed to track refill requests through their lifecycle.
 */
export interface IRefill extends BaseLedgerEntry {
  /** Ledger discriminator for refills */
  type: LedgerType.Refill;
  /** Account ID that will receive the refill credit */
  account: string;
  /** Payment method used for this refill */
  method: RefillMethods;
  /** External reference ID from payment processor or receipt */
  reference: string;
  /** Amount to be credited to user account (in smallest currency unit) */
  amount: bigint; // PHYC amount
  /** Total cost charged to user including processing fees (in smallest currency unit) */
  cost: bigint; // Amount to charge user
  /** Current processing status of the refill */
  status: RefillStatus;
}

/**
 * MongoDB document type for refill storage.
 * Extends IRefill with Mongoose document properties.
 */
export type IRefillDocument = Document & IRefill;

/**
 * Form data for initiating a new refill request.
 * Contains the minimal information required to start a refill process.
 */
export interface IRefillForm {
  /** Account ID that will receive the refill credit */
  account: IRefill['account'];
  /** Selected payment method */
  method: IRefill['method'];
  /** Desired refill amount (excluding fees) */
  amount: IRefill['amount'];
}

// Type guards for runtime validation using typia
/** 
 * Validates if an object conforms to IRefill interface 
 * @function
 */
export const isIRefill = typia.createEquals<IRefill>();
/** 
 * Validates if an object conforms to IRefillForm interface 
 * @function
 */
export const isIRefillForm = typia.createEquals<IRefillForm>();

/** Array of IRefill keys in interface definition order */
export const keysIRefill = keys<IRefill>();
/** Array of IRefillForm keys in interface definition order */
export const keysIRefillForm = keys<IRefillForm>();
