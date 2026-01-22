/**
 * @fileoverview API key types and validation utilities.
 *
 * Provides interfaces for API key records, creation/auth forms,
 * and runtime validators for use across services.
 *
 * @author Jacques Fourie
 */

import { keys } from 'ts-transformer-keys';
import typia from 'typia';
import { HydratedDocument, Model } from 'mongoose';

/**
 * Public API key record returned by the API (does not include the raw key).
 */
export interface IApiKey {
  /** Unique API key identifier */
  id: string;
  /** Owning account id */
  userId: string;
  /** Human-readable name for the key */
  name: string;
  /** Creation timestamp */
  createdAt: Date;
  /** Last-used timestamp (null if never used) */
  lastUsedAt?: Date | null;
}

/**
 * Schema type for API key storage (includes hash and creator for auditing).
 */
export type IApiKeySchema = IApiKey & {
  /** Hashed API key value */
  keyHash: string;
  /** Account id that created the key */
  createdBy: string;
};

/**
 * MongoDB document type for API key storage.
 */
export type IApiKeyDocument = HydratedDocument<IApiKeySchema>;

/**
 * Mongoose model type for the API key schema.
 */
export type IApiKeyModel = Model<IApiKeySchema>;

/**
 * Form data for creating a new API key.
 */
export interface IApiKeyCreateForm {
  /** Name for the API key */
  name: string;
}

/**
 * Form data for authenticating with an API key.
 */
export interface IApiKeyAuthForm {
  /** Raw API key string */
  apiKey: string;
}

// Type guards for runtime validation using typia
export const isIApiKey = typia.createEquals<IApiKey>();
export const isIApiKeyCreateForm = typia.createEquals<IApiKeyCreateForm>();
export const isIApiKeyAuthForm = typia.createEquals<IApiKeyAuthForm>();

/** Array of IApiKey keys in interface definition order */
export const keysIApiKey = keys<IApiKey>();
