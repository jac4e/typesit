/**
 * @fileoverview Product management system with support for stock and order-based products.
 * 
 * This module provides a comprehensive product management system that supports two distinct
 * product types: stock products (kept in inventory) and order products (ordered from suppliers
 * when minimum quantities are met). The system uses conditional typing to ensure type safety
 * and proper validation based on product type.
 * 
 * Key Features:
 * - Dual product types: Stock vs Order products
 * - Type-safe conditional properties based on product type
 * - Category-based organization system
 * - Form interfaces for product creation and editing
 * - MongoDB document interfaces for database operations
 * - Runtime validation with typia type guards
 * 
 * @author Jacques Fourie
 */

import { Document, Model, Schema } from "mongoose";
import { keys } from "ts-transformer-keys";
import typia, { tags } from "typia";
import { IPreOrder } from "./ledgers/preorders";
import { ICoin, IQuantity } from "./common";

/**
 * Enumeration of product categories for organizational purposes.
 * 
 * Categories help organize products into logical groups for easier browsing,
 * inventory management, and reporting. Each product must belong to exactly
 * one category.
 * 
 * @enum {string}
 * 
 * @example
 * ```typescript
 * const product: IProduct = {
 *   // ...other properties
 *   category: ProductCategories.Food,
 * };
 * 
 * // Filtering products by category
 * const foodProducts = products.filter(p => p.category === ProductCategories.Food);
 * ```
 */
export enum ProductCategories {
  /** Food items including snacks, meals, and ingredients */
  Food = 'food',
  
  /** Beverages including soft drinks, coffee, and specialty drinks */
  Drinks = 'drinks',
  
  /** Clothing items including apparel, accessories, and uniforms */
  Clothing = 'clothing',
  
  /** Merchandise including branded items, collectibles, and promotional materials */
  Merch = 'merch',
  
  /** Miscellaneous items that don't fit other categories */
  Other = 'other',
}

/**
 * Enumeration defining the two fundamental product management strategies.
 * 
 * This enum determines how a product is handled in the inventory and ordering system.
 * The choice affects which additional properties are required and how the product
 * lifecycle is managed.
 * 
 * @enum {string}
 * 
 * @example
 * ```typescript
 * // Stock product - kept in inventory
 * const energyDrink: IProduct<ProductTypes.Stock> = {
 *   type: ProductTypes.Stock,
 *   stock: 150n, // 150 units in stock
 *   // ...other properties
 * };
 * 
 * // Order product - ordered from supplier
 * const customTShirt: IProduct<ProductTypes.Order> = {
 *   type: ProductTypes.Order,
 *   order: {
 *     supplier: 'T-Shirt Co',
 *     minimum: 25n, // Minimum order of 25 shirts
 *     current: 12n  // 12 pre-orders so far
 *   },
 *   // ...other properties
 * };
 * ```
 */
export enum ProductTypes {
  /** Products kept in physical inventory for immediate sale */
  Stock = 'stock',
  
  /** Products ordered from suppliers when minimum quantities are reached */
  Order = 'order',
}

// *********************
// * Product Interface *
// *********************

/**
 * Base properties shared by all product types.
 * 
 * This type defines the core properties that every product must have,
 * regardless of whether it's a stock or order product. These properties
 * provide essential product information for display, pricing, and categorization.
 * 
 * @private
 */
type ProductBase = {
  /** Unique identifier for the product */
  id: string;
  
  /** Product category for organization and filtering */
  category: ProductCategories;
  
  /** Human-readable product name */
  name: string;
  
  /** Optional detailed description of the product */
  description?: string;
  
  /** Optional URL or path to product image */
  image?: string;
  
  /** Sale price in smallest currency unit (e.g., cents) */
  price: ICoin
  
  /** Product type determining inventory management strategy */
  type: ProductTypes;
}

/**
 * Type-specific properties that vary based on product type.
 * 
 * This type maps each ProductType to its specific properties:
 * - Order products: require supplier info and quantity tracking
 * - Stock products: require only current stock quantity
 * 
 * @private
 */
type ProductTypedProperties = {
  /** Order product properties for supplier-managed items */
  [ProductTypes.Order]: {
    /** Name of the supplier providing this product */
    supplier: string;
    
    /** Minimum quantity required to place an order with supplier */
    minimum: IQuantity;
    
    /** Current number of pre-orders (calculated from pre-order ledger) */
    current: IQuantity;
  }
  
  /** Stock product properties */
  [ProductTypes.Stock]: {
    /** Current stock level (unlimited if -1) */
    amount: IQuantity,
    /** Average cost of goods sold */
    cost: ICoin
  };
}

/**
 * Union type containing all possible product properties as optional.
 * 
 * This type represents a product where all type-specific properties are optional,
 * making it useful for scenarios where the product type is not yet determined
 * or when working with partial product data.
 * 
 * @private
 */
/**
 * Flexible product type that includes all base properties and optionally any type-specific properties.
 * 
 * This type is used when the product type is unknown or when working with generic products.
 * It includes all base product properties and makes all type-specific properties optional,
 * allowing for runtime determination of the actual product type.
 * 
 * @example
 * ```typescript
 * // When working with products from API without type information
 * const processProduct = (product: AnyProduct) => {
 *   console.log(`Processing: ${product.name}`);
 *   
 *   if (product.type === ProductTypes.Stock && product.stock !== undefined) {
 *     console.log(`Stock level: ${product.stock}`);
 *   } else if (product.type === ProductTypes.Order && product.order !== undefined) {
 *     console.log(`Order minimum: ${product.order.minimum}`);
 *   }
 * };
 * ```
 */
export type AnyProduct = ProductBase & Partial<ProductTypedProperties>;
/**
 * Main product interface with conditional typing based on product type.
 * 
 * This is the primary interface for working with products in the system. It uses
 * TypeScript's conditional types to ensure that the correct properties are available
 * based on the product type specified. When no type is specified, it defaults to
 * AnyProduct allowing for flexible usage.
 * 
 * @template T The product type or AnyProduct if not specified
 * 
 * @example
 * ```typescript
 * // Type-specific product (preferred for type safety)
 * const stockProduct: IProduct<ProductTypes.Stock> = {
 *   id: 'prod_123',
 *   category: ProductCategories.Food,
 *   name: 'Energy Bar',
 *   price: 250n, // $2.50
 *   type: ProductTypes.Stock,
 *   stock: 100n // Must have stock property
 * };
 * 
 * const orderProduct: IProduct<ProductTypes.Order> = {
 *   id: 'prod_456',
 *   category: ProductCategories.Clothing,
 *   name: 'Custom T-Shirt',
 *   price: 2000n, // $20.00
 *   type: ProductTypes.Order,
 *   order: { // Must have order property
 *     supplier: 'Clothing Co',
 *     minimum: 25n,
 *     current: 15n
 *   }
 * };
 * 
 * // Generic product (when type is unknown)
 * const anyProduct: IProduct = {
 *   id: 'prod_789',
 *   category: ProductCategories.Other,
 *   name: 'Mystery Item',
 *   price: 1000n,
 *   type: ProductTypes.Stock
 *   // Additional properties depend on actual type
 * };
 * ```
 */
export type IProduct<T = AnyProduct> = T extends ProductTypes ? Omit<ProductBase, 'type'> & {type: T} & { [key in T]: ProductTypedProperties[T] } : AnyProduct;


// **************************
// * ProductForm Interfaces *
// **************************

type ProductBaseForm = Omit<ProductBase, 'id'>;

// Special typed properties that does not contain generated properties, used for creating new products
type ProductTypedPropertiesForm = {
  [ProductTypes.Order]: Omit<ProductTypedProperties[ProductTypes.Order], 'current'>;
}

type AnyProductForm = ProductBaseForm & Partial<ProductTypedPropertiesForm>;

// Product form type that is used to create a new product, it is the same as IProduct but without the id property
// export type IProductForm<T = AnyProduct> = T extends ProductTypes ? ProductBaseForm & { [key in T]: ProductTypedPropertiesForm[T] } : AnyProductForm;
/**
 * Form data interface for creating or editing products with conditional typing.
 * 
 * This interface represents product data as it would be submitted from a form,
 * before validation and processing. It uses the same conditional typing pattern
 * as IProduct but with form-specific property types (e.g., strings instead of
 * bigints for numeric values).
 * 
 * @template T The product type or AnyProductForm if not specified
 * 
 * @example
 * ```typescript
 * // Creating a stock product from form data
 * const stockForm: IProductForm<ProductTypes.Stock> = {
 *   id: 'prod_123',
 *   category: 'Food',
 *   name: 'Energy Bar',
 *   price: '2.50', // String representation
 *   type: ProductTypes.Stock,
 *   stock: '100' // String representation
 * };
 * 
 * // Processing form data
 * const processForm = (form: IProductForm) => {
 *   const product: IProduct = {
 *     ...form,
 *     price: BigInt(Math.round(parseFloat(form.price) * 100)),
 *     category: form.category as ProductCategories,
 *     // Additional type-specific processing...
 *   };
 * };
 * ```
 */
export type IProductForm<T = AnyProduct> = T extends keyof ProductTypedPropertiesForm ? Omit<ProductBaseForm, 'type'> & {type: T} & { [key in T]: ProductTypedPropertiesForm[T] } : AnyProductForm;


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

/**
 * Base interface for product documents in the database.
 * 
 * This interface represents the common properties of products as stored in
 * the database, excluding the id field which is handled by MongoDB as _id.
 * 
 * @private
 */
type IProductDocumentBase = Omit<ProductBase, 'id'> & Document;

/**
 * Type-specific properties for product documents in database storage format.
 * 
 * This maps product types to their specific properties as they would be stored
 * in the database. String representations are used for certain fields to
 * ensure proper serialization and deserialization.
 * 
 * @private
 */
export type ProductTypedPropertiesDocument = {
  /** Order-specific properties for database storage */
  [ProductTypes.Order]: {
    /** Minimum quantity required (stored as string) */
    minimum: string;
    /** Current pre-order quantity (stored as string) */
    current: string;
  }
}

/**
 * Flexible document type that includes all base properties and optionally any type-specific properties.
 * 
 * This type is used when the product document type is unknown or when working with
 * generic product documents from the database.
 * 
 * @private
 */
type AnyProductDocument = IProductDocumentBase & Partial<ProductTypedPropertiesDocument>;

/**
 * Internal document type for database storage with conditional typing.
 * 
 * This type represents how products are stored in the database, combining
 * the base document properties with type-specific properties. It's used
 * internally by the system and should not be exposed directly to consumers.
 * 
 * @template T The product type or AnyProductDocument if not specified
 * @private
 */
type ProductDocument<T = AnyProduct> = T extends keyof ProductTypedPropertiesDocument ? Omit<IProductDocumentBase, 'type'> & {type: T} & { [key in T]: ProductTypedPropertiesDocument[T] } : AnyProductDocument;

/**
 * MongoDB document interface for products with Mongoose integration.
 * 
 * This interface extends the ProductDocument type with Mongoose's Document
 * interface, providing database-specific functionality like save(), remove(),
 * and other MongoDB operations. It maintains the same conditional typing
 * pattern for type safety.
 * 
 * @template T The product type or AnyProductDocument if not specified
 * 
 * @example
 * ```typescript
 * // Working with product documents in database operations
 * const findStockProduct = async (id: string): Promise<IProductDocument<ProductTypes.Stock> | null> => {
 *   return ProductModel.findOne({ _id: id, type: ProductTypes.Stock });
 * };
 * 
 * const updateStock = async (doc: IProductDocument<ProductTypes.Stock>, newStock: bigint) => {
 *   doc.stock = newStock;
 *   doc.updatedAt = new Date();
 *   await doc.save();
 * };
 * ```
 */
export type IProductDocument<T = AnyProduct> = ProductDocument<T> & Document;


// export type IProductDocument = Omit<IProduct, 'id'> & Document & {
//   price: string;
// }

// ***************
// * Type Guards *
// ***************

/**
 * Type guard to check if an object is a valid IProduct.
 * 
 * This function provides runtime type checking for product objects using typia
 * for validation. It can be used in two ways: with or without a specific type
 * parameter to narrow down to a specific product type.
 * 
 * @template T The specific product type to check for
 * @param product The object to validate
 * @param type Optional specific product type to validate against
 * @returns True if the object is a valid product of the specified type
 * 
 * @example
 * ```typescript
 * // Generic product validation
 * if (isIProduct(data)) {
 *   console.log(`Valid product: ${data.name}`);
 * }
 * 
 * // Type-specific validation
 * if (isIProduct(data, ProductTypes.Stock)) {
 *   console.log(`Stock level: ${data.stock}`); // Type-safe access to stock
 * }
 * 
 * // Using in function parameters
 * const processProduct = (input: unknown) => {
 *   if (!isIProduct(input)) {
 *     throw new Error('Invalid product data');
 *   }
 *   // input is now typed as IProduct
 *   return input.name;
 * };
 * ```
 */
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

/**
 * Type guard to check if an object is a valid IProductForm.
 * 
 * This function provides runtime type checking for product form objects, typically
 * used when validating form submissions before processing them into full product
 * objects. It uses typia for validation and supports both generic and type-specific
 * validation.
 * 
 * @template T The specific product type to check for
 * @param product The object to validate as a product form
 * @param type Optional specific product type to validate against
 * @returns True if the object is a valid product form of the specified type
 * 
 * @example
 * ```typescript
 * // Validating form submission
 * const handleFormSubmit = (formData: unknown) => {
 *   if (!isIProductForm(formData)) {
 *     throw new Error('Invalid product form data');
 *   }
 *   // formData is now typed as IProductForm
 *   return convertFormToProduct(formData);
 * };
 * 
 * // Type-specific validation
 * if (isIProductForm(formData, ProductTypes.Stock)) {
 *   console.log(`Stock form with quantity: ${formData.stock}`);
 * }
 * ```
 */
export function isIProductForm<T extends AnyProductForm = AnyProductForm>(product: any): product is IProductForm<AnyProductForm>;
export function isIProductForm<T extends ProductTypes>(product: any, type: T): product is IProductForm<T>;
export function isIProductForm<T extends ProductTypes | AnyProductForm = AnyProductForm>(product: any, type?: T extends ProductTypes ? T : undefined): product is IProductForm<T> {
  // Check if the product is any product
  if (!typia.equals<AnyProductForm>(product)) return false;

  // if type is not specified, we are checking if the AnyProduct is valid
  if (type === undefined) {
    // For AnyProductForm, we only need to validate the base properties
    // Since both stock and order forms don't have any direct required typed properties
    // (stock property is removed and order properties are optional)
    
    // Check that the type is valid
    if (!Object.values(ProductTypes).includes(product.type)) {
      return false;
    }

    // If it's an order type, validate order properties if present
    if (product.type === ProductTypes.Order && product.order) {
      return typia.equals<ProductTypedPropertiesForm[ProductTypes.Order]>(product.order);
    }

    // For stock type or order type without order properties, just return true
    // as all other validations are handled by the AnyProductForm check above
    return true;
  }

  if (type === ProductTypes.Order) return typia.equals<IProductForm<ProductTypes.Order>>(product);
  if (type === ProductTypes.Stock) return typia.equals<IProductForm<ProductTypes.Stock>>(product);
  return false;
}

/**
 * Type guard to check if an object is a valid IProductDocument.
 * 
 * This function provides runtime type checking for product document objects
 * as they would exist in the database. It's primarily used in backend code
 * when working with MongoDB documents and ensuring data integrity.
 * 
 * Note: This type guard cannot be fully tested in isolation as it requires
 * a MongoDB schema and model, which exist in the backend codebase.
 * 
 * @template T The specific product type to check for
 * @param product The object to validate as a product document
 * @param type Optional specific product type to validate against
 * @returns True if the object is a valid product document of the specified type
 * 
 * @example
 * ```typescript
 * // Validating database query results
 * const findAndValidateProduct = async (id: string) => {
 *   const doc = await ProductModel.findById(id);
 *   if (!isIProductDocument(doc)) {
 *     throw new Error('Invalid product document from database');
 *   }
 *   return doc;
 * };
 * 
 * // Type-specific validation in database operations
 * const updateStockProduct = async (doc: unknown, newStock: string) => {
 *   if (!isIProductDocument(doc, ProductTypes.Stock)) {
 *     throw new Error('Document is not a stock product');
 *   }
 *   doc.stock = newStock;
 *   await doc.save();
 * };
 * ```
 */
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

/**
 * Utility array containing all keys of the IProduct interface.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on the IProduct interface, useful for dynamic property
 * access, validation, or iteration.
 * 
 * @example
 * ```typescript
 * // Iterating over all product properties
 * keysIProduct.forEach(key => {
 *   console.log(`Product has property: ${key}`);
 * });
 * 
 * // Validating object has all required keys
 * const hasAllKeys = keysIProduct.every(key => key in productObject);
 * ```
 */
export const keysIProduct = keys<IProduct>();

/**
 * Utility array containing all keys specific to stock products.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on stock products, including base properties and the stock-specific
 * property.
 * 
 * @example
 * ```typescript
 * // Extracting only stock product properties
 * const stockData = keysIProductStock.reduce((acc, key) => {
 *   if (key in sourceObject) acc[key] = sourceObject[key];
 *   return acc;
 * }, {});
 * ```
 */
export const keysIProductStock = [...keys<ProductBase>(), ProductTypes.Stock] as (keyof IProduct<ProductTypes.Stock>)[];

/**
 * Utility array containing all keys specific to order products.
 * 
 * This exported constant provides a runtime array of all property keys
 * that exist on order products, including base properties and the order-specific
 * property.
 * 
 * @example
 * ```typescript
 * // Validating order product structure
 * const isValidOrderProduct = keysIProductOrder.every(key => 
 *   key in productObject && productObject[key] !== undefined
 * );
 * ```
 */
export const keysIProductOrder = [...keys<ProductBase>(), ProductTypes.Order] as (keyof IProduct<ProductTypes.Order>)[];

/**
 * Utility array containing all keys of the IProductForm interface.
 */
export const keysIProductForm = keys<IProductForm>();

/**
 * Utility array containing all keys specific to stock product forms.
 */
export const keysIProductFormStock = keys<ProductBaseForm>() as (keyof IProductForm<ProductTypes.Stock>)[];

/**
 * Utility array containing all keys specific to order product forms.
 */
export const keysIProductFormOrder = [...keys<ProductBaseForm>(), ProductTypes.Order] as (keyof IProductForm<ProductTypes.Order>)[];
