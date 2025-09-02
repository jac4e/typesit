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
import { Document } from 'mongoose';
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
 * MongoDB document type for account storage.
 * Extends IAccount with database-specific fields and excludes client-only properties.
 */
export type IAccountDocument = Omit<IAccount, 'id' | 'balance'> & Document & {
    /** Password hash for authentication */
    hash: string;
    /** Current session identifier */
    sessionid: string;
};

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
/** Validates if an object conforms to IAccount interface */
export const isIAccount = typia.createEquals<IAccount>();
/** Validates if an object conforms to IAccountBaseForm interface */
export const isIAccountBaseForm = typia.createEquals<IAccountBaseForm>();
/** Validates if an object conforms to IAccountSettingsForm interface */
export const isIAccountSettingsForm = typia.createEquals<IAccountSettingsForm>();
/** Validates if an object conforms to IAccountPasswordForm interface */
export const isIAccountPasswordForm = typia.createEquals<IAccountPasswordForm>();
/** Validates if an object conforms to ICredentials interface */
export const isICredentials = typia.createEquals<ICredentials>();

/** Array of IAccount keys in interface definition order */
export const keysIAccount = keys<IAccount>();
