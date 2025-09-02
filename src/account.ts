import { keys } from 'ts-transformer-keys';
import typia, { tags } from "typia";
import { Document } from 'mongoose';
import { ICoin } from './common';

export enum Roles {
    Unverified = 'unverified', // Unverified account created through registration form
    Member = 'member', // Verified club member account
    NonMember = 'nonmember', // Verified club member account
    Admin = 'admin' // Admin account
}

export interface IAccount {
    id: string;
    gid?: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Roles;
    balance: ICoin;
    notify: boolean;
}

export interface ICredentials {
    username: string;
    password: string;
}

export type IAccountDocument = Omit<IAccount, 'id' | 'balance'> & Document & {
    hash: string;
    sessionid: string;
};

export type IAccountBaseForm = Omit<IAccount, 'id' | 'balance' | 'gid'> & {
    password: string;
}

export type IAccountSettingsForm = Omit<IAccountBaseForm, 'role' | 'password'>

export interface IAccountPasswordForm {
    password: string;
}

export const isIAccount = typia.createEquals<IAccount>();
export const isIAccountBaseForm = typia.createEquals<IAccountBaseForm>();
export const isIAccountSettingsForm = typia.createEquals<IAccountSettingsForm>();
export const isIAccountPasswordForm = typia.createEquals<IAccountPasswordForm>();
export const isICredentials = typia.createEquals<ICredentials>();

export const keysIAccount = keys<IAccount>();
