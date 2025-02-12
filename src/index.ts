import { keys } from 'ts-transformer-keys';
import { IAccount, isIAccount, keysIAccount } from './account.js';
import { IProduct, ProductTypes, isIProduct, keysIProduct, keysIProductOrder, keysIProductStock } from './product.js';
import { isITransaction, ITransaction, keysITransaction } from './transaction.js';
import { IPreOrder, isIPreOrder, keysIPreOrder } from './preorders.js';
import { IStockEntry, isIStockEntry, keysIStockEntry } from './stock.js';
import { isIRefill, keysIRefill } from './refill.js';

// export * from './account';
export { IAccount, ICredentials, IAccountDocument, IAccountForm, Roles, isIAccount, isIAccountForm, isICredentials } from './account.js';
// export * from './cart';
export { ICartItem, ICartItemSerialized, ICart, ICartSerialized, isICartItem, isICart, isICartSerialized } from './cart.js';
// export * from './log';
// export * from './product';
export { IProduct, ProductCategories, ProductTypes, isIProduct } from './product.js';
// export * from './preorders';
export { IPreOrder, PreOrderStatus, isIPreOrder } from './preorders.js';
// export * from './stock';
export { IStockEntry, StockEntryType, isIStockEntry } from './stock.js';
// export * from './transaction';
export { ITransaction, TransactionType, ITransactionForm, ITransactionItem, ITransactionDocument, isITransaction, isITransactionForm } from './transaction.js';
export * from './refill.js';


type AvailableTypes = IAccount | ITransaction | IProduct | IProduct<ProductTypes.Stock> | IProduct<ProductTypes.Order> | IPreOrder | IStockEntry;

export type UnionKeys<Type> = Type extends Type ? keyof Type: never;
export type UnionValues<Type> = Type extends Type ? Type[keyof Type]: never;
export type UnionKeysValues<Type> = Type extends Type ? {key: UnionKeys<Type>, value: UnionValues<Type>}: never;

// Useful functions to ensure order of keys/values for interfaces match their interface definition


// Returns an array of the objects keys
export function getKeys<Type>(obj: Type) {
    if (isIAccount(obj)) {
        return keysIAccount as (UnionKeys<Type>)[];
    } else if (isITransaction(obj)) {
        return keysITransaction as (UnionKeys<Type>)[];
    } else if (isIProduct(obj, ProductTypes.Order)) {
        return keysIProductOrder as (UnionKeys<Type>)[];
    } else if (isIProduct(obj, ProductTypes.Stock)) {
        return keysIProductStock as (UnionKeys<Type>)[];
    } else if (isIProduct(obj)) {
        return keysIProduct as (UnionKeys<Type>)[];  
    } else if (isIPreOrder(obj)) {
        return keysIPreOrder as (UnionKeys<Type>)[];
    } else if (isIStockEntry(obj)) {
        return keysIStockEntry as (UnionKeys<Type>)[];
    } else if (isIRefill(obj)) {
        return keysIRefill as (UnionKeys<Type>)[];
    } else {
        return [];
    }
}

// returns an array of the objects values
export function getValues<Type>(obj: Type) {
    if (isIAccount(obj)) {
        return [
            obj.id,
            obj.gid,
            obj.username,
            obj.firstName,
            obj.lastName,
            obj.email,
            obj.role,
            obj.balance,
            obj.notify
        ] as (UnionValues<Type>)[];
    } else if (isITransaction(obj)) {
        return [
            obj.date,
            obj.id,
            obj.accountid,
            obj.type,
            obj.reason,
            obj.products,
            obj.total
        ] as (UnionValues<Type>)[];
    } else if (isIProduct(obj)) {
        return [
            obj.id,
            obj.category,
            obj.name,
            obj.description,
            obj.image,
            obj.price,
            obj.type,
            obj.order ? obj.order : (obj.stock ? obj.stock : undefined)
        ] as (UnionValues<Type>)[];
    } else if (isIPreOrder(obj)) {
        return [
            obj.date,
            obj.lastUpdated,
            obj.id,
            obj.accountId,
            obj.amount,
            obj.status,
        ] as (UnionValues<Type>)[];
    } else if (isIStockEntry(obj)) {
        return [
            obj.id,
            obj.date,
            obj.productid,
            obj.cost,
            obj.type,
            obj.delta,
            obj.notes,
        ] as (UnionValues<Type>)[];
    } else if (isIRefill(obj)) {
        return [
            obj.id,
            obj.account,
            obj.method,
            obj.reference,
            obj.amount,
            obj.cost,
            obj.dateCreated,
            obj.dateUpdated,
            obj.status,
            obj.note
        ] as (UnionValues<Type>)[];
    } else {
        return [];
    }
}

export function getObject<Type extends AvailableTypes>(item: Type): {key: keyof Type; value: Type[keyof Type]}[] {
    const returnArray = [] as {key: keyof Type; value: Type[keyof Type]}[];
    const keys = getKeys(item);
    const values = getValues(item);

    for (let index = 0; index < keys.length; index++) {
        returnArray.push({key: keys[index], value: values[index]});
    }

    return returnArray;
}

// Hijack bigint for json serialization because the spec writers hate me
// Had to update using method found here https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-1721402063
// as previous method (BigInt.prototype.toJSON = function() { return this.toString(); }) was not working anymore
Object.defineProperty(BigInt.prototype, "toJSON", {
    get() {
        "use strict";
        return () => String(this);
    }
});