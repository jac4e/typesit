import { Document, Model, Schema } from "mongoose";
import { keys } from "ts-transformer-keys";
import typia, { tags } from "typia";
import { IPreOrder } from "./ledgers/preorders";
import { ICoin, IQuantity } from "./common";

export enum ProductCategories {
  Food = 'food',
  Drinks = 'drinks',
  Clothing = 'clothing',
  Merch = 'merch',
  Other = 'other',
}

export enum ProductTypes {
  Stock = 'stock', // Stuff we keep in stock
  Order = 'order', // Stuff we order from the supplier after minimum order quantity is met
}

// *********************
// * Product Interface *
// *********************

// Base properties used by all products
type ProductBase = {
  id: string;
  category: ProductCategories;
  name: string;
  description?: string;
  image?: string;
  price: ICoin // Sale price
  type: ProductTypes;
}

// Properties that are specific to the type of product, properties must be an object with the same keys as the ProductTypes enum
type ProductTypedProperties = {
  [ProductTypes.Order]: {
    supplier: string;
    minimum: IQuantity;
    current: IQuantity; // Generated from pre-orders journal
  }
  [ProductTypes.Stock]: IQuantity; // Generated from stock journal
}

// An ambiguous product type that contains all typed properties as optional, this means any typed product should be a subset of this type
type AnyProduct = ProductBase & Partial<ProductTypedProperties>;

// Public product interface that maps the properties based on typed specified with T, if no type is specified it will default to AnyProduct
export type IProduct<T = AnyProduct> = T extends ProductTypes ? Omit<ProductBase, 'type'> & {type: T} & { [key in T]: ProductTypedProperties[T] } : AnyProduct;


// **************************
// * ProductForm Interfaces *
// **************************

type ProductBaseForm = Omit<ProductBase, 'id'>;

// Special typed properties that does not contain generated properties, used for creating new products
type ProductTypedPropertiesForm = {
  [ProductTypes.Order]: Omit<ProductTypedProperties[ProductTypes.Order], 'current'>;
  [ProductTypes.Stock]: ProductTypedProperties[ProductTypes.Stock];
}

type AnyProductForm = ProductBaseForm & Partial<ProductTypedPropertiesForm>;

// Product form type that is used to create a new product, it is the same as IProduct but without the id property
// export type IProductForm<T = AnyProduct> = T extends ProductTypes ? ProductBaseForm & { [key in T]: ProductTypedPropertiesForm[T] } : AnyProductForm;
export type IProductForm<T = AnyProduct> = T extends ProductTypes ? Omit<ProductBaseForm, 'type'> & {type: T} & { [key in T]: ProductTypedPropertiesForm[T] } : AnyProductForm;


// Alternative approach to IProductForm ?? simpler but less flexible
// type ProductForm = {
//   category: ProductCategories;
//   name: string;
//   description?: string;
//   image?: string;
//   price: ICoin
//   type: ProductTypes;
//   minimum?: IQuantity;
//   current?: IQuantity;
//   stock?: IQuantity;
// }
// export type IProductForm<T = ProductForm> = T extends ProductTypes ? ProductForm & { [key in T]: ProductTypedPropertiesForm[T] } : ProductForm;

// *************************
// * ProductDocument Types *
// *************************

type IProductDocumentBase = Omit<IProduct, 'id'>;

export type ProductTypedPropertiesDocument = {
  [ProductTypes.Order]: {
    minimum: string;
    current: string;
  }
  [ProductTypes.Stock]: string;
}

type AnyProductDocument = IProductDocumentBase & Partial<ProductTypedPropertiesDocument>;
type ProductDocument<T = AnyProduct> = T extends ProductTypes ? Omit<IProductDocumentBase, 'type'> & {type: T} & { [key in T]: ProductTypedPropertiesDocument[T] } : AnyProductDocument;

export type IProductDocument<T = AnyProduct> = ProductDocument<T> & Document;


// export type IProductDocument = Omit<IProduct, 'id'> & Document & {
//   price: string;
// }

// ***************
// * Type Guards *
// ***************

// IProduct type guard
export function isIProduct<T extends AnyProduct = AnyProduct>(product: any): product is IProduct<AnyProduct>;
export function isIProduct<T extends ProductTypes>(product: any, type: T): product is IProduct<T>;
export function isIProduct<T extends ProductTypes | AnyProduct = AnyProduct>(product: any, type?: T extends ProductTypes ? T : undefined): product is IProduct<T> {
  // Check if the product is any product
  if (!typia.equals<AnyProduct>(product)) return false;

  // if type is not specified, we are checking if the AnyProduct is valid
  if (type === undefined){
    // If we are testing for AnyProduct, we need to confirm that only one of the typed properties is present, and that it is correctly defined
    // This is to ensure that the AnyProduct is actually a valid typed product
    // Although AnyProduct has all typed properties as optional, to be functionally correct, it should have only one typed property

    // Check if only one typed property is present
    const hasOneTypedProperty = Object.keys(product).filter(key => keys<ProductTypedProperties>().includes(key as keyof ProductTypedProperties)).length === 1;
    if (!hasOneTypedProperty) return false;

    // Check that the typed property key is valid
    const typedPropertyKey = Object.keys(product).find(key => keys<ProductTypedProperties>().includes(key as keyof ProductTypedProperties)) as keyof ProductTypedProperties;
    // check if the typed property matches the products specified type
    const productTypeMatches = product.type === typedPropertyKey;

    if (!productTypeMatches) return false;

    // Do not use T or type here, as this logic is for verifying AnyProduct, not IProduct<T extends ProductTypes>
    const isTypedPropertyCorrect = typia.equals<ProductTypedProperties[keyof ProductTypedProperties]>(product[typedPropertyKey]);

    // Return the results of isTypedPropertyCorrect if type is not specified (aka testing for any product)
    return isTypedPropertyCorrect;
  }

  if (type === ProductTypes.Order) return typia.equals<IProduct<ProductTypes.Order>>(product);
  if (type === ProductTypes.Stock) return typia.equals<IProduct<ProductTypes.Stock>>(product);
  return false;
}

// IProductForm type guard
export function isIProductForm<T extends AnyProductForm = AnyProductForm>(product: any): product is IProductForm<AnyProductForm>;
export function isIProductForm<T extends ProductTypes>(product: any, type: T): product is IProductForm<T>;
export function isIProductForm<T extends ProductTypes | AnyProductForm = AnyProductForm>(product: any, type?: T extends ProductTypes ? T : undefined): product is IProductForm<T> {
  // Check if the product is any product
  if (!typia.equals<AnyProductForm>(product)) return false;

  // if type is not specified, we are checking if the AnyProduct is valid
  if (type === undefined){
    // If we are testing for AnyProduct, we need to confirm that only one of the typed properties is present, and that it is correctly defined
    // This is to ensure that the AnyProduct is actually a valid typed product
    // Although AnyProduct has all typed properties as optional, to be functionally correct, it should have only one typed property

    // Check if only one typed property is present
    const hasOneTypedProperty =  Object.keys(product).filter(key => keys<ProductTypedPropertiesForm>().includes(key as keyof ProductTypedPropertiesForm)).length === 1;

    if (!hasOneTypedProperty) return false;

    // Check that the typed property key is valid
    const typedPropertyKey = Object.keys(product).find(key => keys<ProductTypedPropertiesForm>().includes(key as keyof ProductTypedPropertiesForm)) as keyof ProductTypedPropertiesForm;

    // check if the typed property matches the products specified type
    const productTypeMatches = product.type === typedPropertyKey;

    if (!productTypeMatches) return false;

    // Do not use T or type here, as this logic is for verifying AnyProduct, not IProduct<T extends ProductTypes>
    const isTypedPropertyCorrect = typia.equals<ProductTypedPropertiesForm[keyof ProductTypedPropertiesForm]>(product[typedPropertyKey]);

    // Return the results of isTypedPropertyCorrect if type is not specified (aka testing for any product)
    return isTypedPropertyCorrect;
  }

  if (type === ProductTypes.Order) return typia.equals<IProductForm<ProductTypes.Order>>(product);
  if (type === ProductTypes.Stock) return typia.equals<IProductForm<ProductTypes.Stock>>(product);
  return false;
}

// Cannot test this as it is not possible to create a document without a schema and model, which live in the backend codebase
// IProductDocument type guard
export function isIProductDocument<T extends AnyProductDocument = AnyProductDocument>(product: any): product is IProductDocument<AnyProductDocument>;
export function isIProductDocument<T extends ProductTypes>(product: any, type: T): product is IProductDocument<T>;
export function isIProductDocument<T extends ProductTypes | AnyProductDocument = AnyProductDocument>(product: any, type?: T extends ProductTypes ? T : undefined): product is IProductDocument<T> {
  // Check if the product is any product
  if (!typia.equals<AnyProductDocument>(product)) return false;

  // if type is not specified, we are checking if the AnyProduct is valid
  if (type === undefined){
    // If we are testing for AnyProduct, we need to confirm that only one of the typed properties is present, and that it is correctly defined
    // This is to ensure that the AnyProduct is actually a valid typed product
    // Although AnyProduct has all typed properties as optional, to be functionally correct, it should have only one typed property

    // Check if only one typed property is present
    const hasOneTypedProperty = Object.keys(product).filter(key => keys<ProductTypedPropertiesDocument>().includes(key as keyof ProductTypedPropertiesDocument)).length === 1;

    if (!hasOneTypedProperty) return false;

    // Check that the typed property key is valid
    const typedPropertyKey = Object.keys(product).find(key => keys<ProductTypedPropertiesDocument>().includes(key as keyof ProductTypedPropertiesDocument)) as keyof ProductTypedPropertiesDocument;

    // check if the typed property matches the products specified type
    const productTypeMatches = product.type === typedPropertyKey;

    if (!productTypeMatches) return false;

    // Do not use T or type here, as this logic is for verifying AnyProduct, not IProduct<T extends ProductTypes>
    const isTypedPropertyCorrect = typia.equals<ProductTypedPropertiesDocument[keyof ProductTypedPropertiesDocument]>(product[typedPropertyKey]);

    // Return the results of isTypedPropertyCorrect if type is not specified (aka testing for any product)
    return isTypedPropertyCorrect;
  }

  if (type === ProductTypes.Order) return typia.equals<IProductDocument<ProductTypes.Order>>(product);
  if (type === ProductTypes.Stock) return typia.equals<IProductDocument<ProductTypes.Stock>>(product);
  return false;
}

export const keysIProduct = keys<IProduct>();
export const keysIProductStock = [...keys<ProductBase>(), ProductTypes.Stock] as (keyof IProduct<ProductTypes.Stock>)[];
export const keysIProductOrder = [...keys<ProductBase>(), ProductTypes.Order] as (keyof IProduct<ProductTypes.Order>)[];
