import { IProduct } from '../product';
import typia from "typia";
import { keys } from 'ts-transformer-keys';
import { Model, Schema, Document } from 'mongoose';
import { ICoin, IQuantity } from '../common';

// Types
export enum StockEntryType {
    Purchase = 'purchase', // Purchase from supplier
    Shrinkage = 'shrinkage', // Shrinkage due to theft, damage, spoilage, etc.
    Overage = 'overage', // Overage due to miscount, etc.
    Sale = 'sale', // Sale to customer
}

// ****************************
// * Stock Entry Interface *
// ****************************

// Base properties used by all stock entries
type StockEntryBase = {
    id: string;
    date: Date | string;
    productId: IProduct['id'];
    type: StockEntryType;
    delta: IQuantity; // Positive for increase, negative for decrease
    notes?: string;
}

// Properties that are specific to the type of stock entry
type StockTypedProperties = {
    [StockEntryType.Purchase]: {
        cost: ICoin; // Cost per unit at time of entry - only for purchases
    }
    [StockEntryType.Shrinkage]: {}
    [StockEntryType.Overage]: {}
    [StockEntryType.Sale]: {}
}

// An ambiguous stock entry type that contains all typed properties as optional
type AnyStockEntry = StockEntryBase & Partial<StockTypedProperties[StockEntryType.Purchase]>;

// Public stock entry interface that maps the properties based on type specified with T
export type IStockEntry<T = AnyStockEntry> = T extends StockEntryType ? Omit<StockEntryBase, 'type'> & {type: T} & StockTypedProperties[T] : AnyStockEntry;

// *********************************
// * Stock Entry Form Interfaces *
// *********************************

type StockEntryBaseForm = Omit<StockEntryBase, 'id' | 'date'>;

// Typed properties for forms (same as base since no generated properties)
type StockTypedPropertiesForm = StockTypedProperties;

type AnyStockEntryForm = StockEntryBaseForm & Partial<StockTypedPropertiesForm[StockEntryType.Purchase]>;

// Stock entry form type that is used to create a new stock entry
export type IStockEntryForm<T = AnyStockEntryForm> = T extends StockEntryType ? Omit<StockEntryBaseForm, 'type'> & {type: T} & StockTypedPropertiesForm[T] : AnyStockEntryForm;

// ************************************
// * Stock Entry Document Types *
// ************************************

type IStockEntryDocumentBase = Omit<IStockEntry, 'id'>;

export type StockTypedPropertiesDocument = {
    [StockEntryType.Purchase]: {
        cost: string; // Cost stored as string in database
    }
    [StockEntryType.Shrinkage]: {}
    [StockEntryType.Overage]: {}
    [StockEntryType.Sale]: {}
}

type AnyStockEntryDocument = Omit<IStockEntryDocumentBase, 'delta'> & Document & {
    delta: string;
} & Partial<StockTypedPropertiesDocument[StockEntryType.Purchase]>;

type StockEntryDocument<T = AnyStockEntry> = T extends StockEntryType ? Omit<IStockEntryDocumentBase, 'type' | 'delta'> & {type: T} & {delta: string} & StockTypedPropertiesDocument[T] : AnyStockEntryDocument;

export type IStockEntryDocument<T = AnyStockEntry> = StockEntryDocument<T> & Document;

// ***************
// * Type Guards *
// ***************

// IStockEntry type guard
export function isIStockEntry<T extends AnyStockEntry = AnyStockEntry>(entry: any): entry is IStockEntry<AnyStockEntry>;
export function isIStockEntry<T extends StockEntryType>(entry: any, type: T): entry is IStockEntry<T>;
export function isIStockEntry<T extends StockEntryType | AnyStockEntry = AnyStockEntry>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntry<T> {
    // Check if the entry is any stock entry
    if (!typia.equals<AnyStockEntry>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntry is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        // If it's a Purchase type, it must have the cost property
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedProperties[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        // For other types, no additional properties are required
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntry<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntry<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntry<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntry<StockEntryType.Sale>>(entry);
    return false;
}

// IStockEntryForm type guard
export function isIStockEntryForm<T extends AnyStockEntryForm = AnyStockEntryForm>(entry: any): entry is IStockEntryForm<AnyStockEntryForm>;
export function isIStockEntryForm<T extends StockEntryType>(entry: any, type: T): entry is IStockEntryForm<T>;
export function isIStockEntryForm<T extends StockEntryType | AnyStockEntryForm = AnyStockEntryForm>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntryForm<T> {
    // Check if the entry is any stock entry form
    if (!typia.equals<AnyStockEntryForm>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntryForm is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedPropertiesForm[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntryForm<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntryForm<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntryForm<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntryForm<StockEntryType.Sale>>(entry);
    return false;
}

// IStockEntryDocument type guard
export function isIStockEntryDocument<T extends AnyStockEntryDocument = AnyStockEntryDocument>(entry: any): entry is IStockEntryDocument<AnyStockEntryDocument>;
export function isIStockEntryDocument<T extends StockEntryType>(entry: any, type: T): entry is IStockEntryDocument<T>;
export function isIStockEntryDocument<T extends StockEntryType | AnyStockEntryDocument = AnyStockEntryDocument>(entry: any, type?: T extends StockEntryType ? T : undefined): entry is IStockEntryDocument<T> {
    // Check if the entry is any stock entry document
    if (!typia.equals<AnyStockEntryDocument>(entry)) return false;

    // if type is not specified, we are checking if the AnyStockEntryDocument is valid
    if (type === undefined) {
        // For stock entries, only Purchase type has additional properties
        if (entry.type === StockEntryType.Purchase) {
            return typia.equals<StockTypedPropertiesDocument[StockEntryType.Purchase]>({ cost: entry.cost });
        }
        return true;
    }

    if (type === StockEntryType.Purchase) return typia.equals<IStockEntryDocument<StockEntryType.Purchase>>(entry);
    if (type === StockEntryType.Shrinkage) return typia.equals<IStockEntryDocument<StockEntryType.Shrinkage>>(entry);
    if (type === StockEntryType.Overage) return typia.equals<IStockEntryDocument<StockEntryType.Overage>>(entry);
    if (type === StockEntryType.Sale) return typia.equals<IStockEntryDocument<StockEntryType.Sale>>(entry);
    return false;
}

export const keysIStockEntry = keys<IStockEntry>();
export const keysIStockEntryPurchase = [...keys<StockEntryBase>(), 'cost'] as (keyof IStockEntry<StockEntryType.Purchase>)[];
export const keysIStockEntryShrinkage = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Shrinkage>)[];
export const keysIStockEntryOverage = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Overage>)[];
export const keysIStockEntrySale = keys<StockEntryBase>() as (keyof IStockEntry<StockEntryType.Sale>)[];
