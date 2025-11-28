/**
 * @fileoverview Account management types and validation functions.
 * 
 * This module provides comprehensive type definitions for user accounts including:
 * - Account roles and permissions
 * - User credentials and authentication
 * - Account forms for registration and settings
 * - Type guards for runtime validation
 * 
 * @author Jacques Fourie
 */

import { keys } from 'ts-transformer-keys';
import typia, { tags } from "typia";
import { Document, HydratedDocument, Model } from 'mongoose';
import { ICoin } from './common';

/**
 * Enumeration of user roles with different permission levels.
 * Roles determine what actions a user can perform in the system.
 */
export enum Roles {
    /** Unverified account created through registration form - limited access */
    Unverified = 'unverified',
    /** Verified club member account - standard access */  
    Member = 'member',
    /** Verified non-member account - limited access */
    NonMember = 'nonMember',
    /** Admin account - full system access */
    Admin = 'admin'
}

/**
 * Enumeration of account form types for different update operations.
 * Used to distinguish between settings updates and password changes.
 * @remarks
 * This enum helps in routing form submissions to the appropriate handlers.
 * @see IAccountSettingsForm
 * @see IAccountPasswordForm
 * @example
 * // Example usage:
 * function handleAccountUpdate(type: AccountFormTypes, formData: IAccountSettingsForm | IAccountPasswordForm) {
 *  if (type === AccountFormTypes.Settings) {
 *   // Handle settings update
 *  } else if (type === AccountFormTypes.Password) {
 *  // Handle password change
 * }
 * }
 * 
 */
export enum AccountFormTypes {
    Settings = 'settings',
    Password = 'password'
}

/**
 * Core account interface representing a user account in the system.
 * Contains all essential user information and account state.
 */
export interface IAccount {
    /** Unique account identifier */
    id: string;
    /** Optional Google ID for OAuth integration */
    gid?: string;
    /** Unique username for login */
    username: string;
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** User's email address */
    email: string;
    /** User's role determining permissions */
    role: Roles;
    /** Account balance in smallest currency unit */
    balance: ICoin;
    /** Whether user has opted in to notifications */
    notify: boolean;
}

/**
 * User credentials for authentication.
 */
export interface ICredentials {
    /** Username for login */
    username: string;
    /** Password for authentication */
    password: string;
}

/**
 * Represents the schema for an account as stored in the database.
 * Omits the 'id' and 'balance' properties from IAccount, since 'id' is provided by the database,
 * and adds 'hash' and 'sessionid' fields for authentication/session management.
 *
 * @remarks
 * This type is used for persisting accounts in the database, where the database generates the unique identifier.
 *
 * @property {string} hash - The hashed password for the account.
 * @property {string} sessionid - The session identifier associated with the account.
 */
export type IAccountSchema = Omit<IAccount, 'id' | 'balance'> & {
    hash: string;
    sessionid: string;
};

/**
 * MongoDB document type for account storage.
 * Extends IAccountSchema with database-specific fields and excludes client-only properties.
 * 
 * @see IAccountSchema
 */
export type IAccountDocument = HydratedDocument<IAccountSchema>;

/**
 * Mongoose model type for the Account schema.
 * 
 * Provides static and instance methods for interacting with account documents in the database.
 * Used for querying, creating, updating, and deleting account records.
 * 
 * @see IAccountSchema
 * @see IAccountDocument
 */
export type IAccountModel = Model<IAccountSchema>;

/**
 * Form data for creating a new account.
 * Excludes generated fields like id and balance, includes password for initial setup.
 */
export type IAccountBaseForm = Omit<IAccount, 'id' | 'balance' | 'gid'> & {
    /** Plain text password for account creation */
    password: string;
}

/**
 * Form data for updating account settings.
 * Excludes role and password changes which require separate operations.
 */
export type IAccountSettingsForm = Omit<IAccountBaseForm, 'role' | 'password'>

/**
 * Form data for password changes.
 */
export interface IAccountPasswordForm {
    /** New password */
    password: string;
}

// Type guards for runtime validation using typia
/** 
 * Validates if an object conforms to IAccount interface
 * @function
 */
export const isIAccount = typia.createEquals<IAccount>();
/** 
 * Validates if an object conforms to IAccountBaseForm interface 
 * @function
 */
export const isIAccountBaseForm = typia.createEquals<IAccountBaseForm>();
/** 
 * Validates if an object conforms to IAccountSettingsForm interface 
 * @function
 */
export const isIAccountSettingsForm = typia.createEquals<IAccountSettingsForm>();
/** 
 * Validates if an object conforms to IAccountPasswordForm interface 
 * @function
 */
export const isIAccountPasswordForm = typia.createEquals<IAccountPasswordForm>();
/** 
 * Validates if an object conforms to ICredentials interface 
 * @function
 */
export const isICredentials = typia.createEquals<ICredentials>();

/** Array of IAccount keys in interface definition order */
export const keysIAccount = keys<IAccount>();

/** Array of IAccountBaseForm keys in interface definition order */
export const keysIAccountBaseForm = keys<IAccountBaseForm>();

/** Array of IAccountSettingsForm keys in interface definition order */
export const keysIAccountSettingsForm = keys<IAccountSettingsForm>();
