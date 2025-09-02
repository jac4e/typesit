import { IProduct, ProductTypedPropertiesDocument } from "./product";

export type ICoin = bigint;
export type IQuantity = bigint;

// HTTP<T> type should replace all bigint types on the T interface with BigIntHTTP and all Date types with DateHTTP
export type HTTP<T> = {
    [K in keyof T]: T[K] extends bigint ? string : T[K] extends Date ? string : T[K] extends (bigint | undefined) ? (string | undefined) :  T[K] extends Omit<ProductTypedPropertiesDocument["order"],"current"> | undefined ? HTTP<Omit<ProductTypedPropertiesDocument["order"],"current">> | undefined : T[K];
};
