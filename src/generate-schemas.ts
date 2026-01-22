/**
 * @fileoverview JSON Schema generation script for typeit library.
 * 
 * This script generates comprehensive JSON schemas for all types exposed by
 * the typeit library. The schemas are generated using typia and are suitable
 * for use with OpenAPI/Swagger documentation, form validation, and API clients.
 * 
 * Features:
 * - Generates schemas for all HTTP-safe type projections (bigint → string, Date → string)
 * - Organizes schemas by domain (accounts, products, ledgers, etc.)
 * - Includes all enums as referenceable components
 * - Generates both individual schemas and a combined OpenAPI-compatible schema
 * 
 * Run from the typeit package root:
 *   npm run schemas
 * 
 * @author Jacques Fourie
 */

import typia from "typia";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ============================================================================
// Account Types
// ============================================================================
import {
  AccountFormTypes,
  IAccount,
  IAccountBaseForm,
  IAccountPasswordForm,
  IAccountSettingsForm,
  ICredentials,
  Roles,
} from "./account.js";
import {
  IApiKey,
  IApiKeyCreateForm,
  IApiKeyAuthForm,
} from "./api-key.js";

// ============================================================================
// Product Types
// ============================================================================
import {
  IProduct,
  IProductForm,
  ProductTypes,
  ProductCategories,
} from "./product.js";

// ============================================================================
// Cart Types
// ============================================================================
import {
  ICart,
  ICartSerialized,
  ICartItem,
  ICartItemSerialized,
} from "./cart.js";

// ============================================================================
// Ledger Types - Transactions
// ============================================================================
import {
  ITransaction,
  ITransactionForm,
  ITransactionItem,
  TransactionType,
} from "./ledgers/transaction.js";

// ============================================================================
// Ledger Types - Refills
// ============================================================================
import {
  IRefill,
  IRefillForm,
  RefillMethods,
  RefillStatus,
} from "./ledgers/refill.js";

// ============================================================================
// Ledger Types - Pre-orders
// ============================================================================
import {
  IPreOrder,
  IPreOrderForm,
  PreOrderStatus,
} from "./ledgers/preorders.js";

// ============================================================================
// Ledger Types - Stock
// ============================================================================
import {
  IStockEntry,
  IStockEntryForm,
  StockEntryType,
} from "./ledgers/stock.js";

// ============================================================================
// Ledger Types - Combined
// ============================================================================
import {
  ILedger,
  ILedgerForm,
  LedgerType,
} from "./ledgers/ledgers.js";

// ============================================================================
// Common Types
// ============================================================================
import { HTTP } from "./common.js";

// ============================================================================
// Error Types
// ============================================================================
import { IError } from "./error.js";

// ============================================================================
// Log Types
// ============================================================================
import { Log } from "./log.js";

// ============================================================================
// Statistics Types
// ============================================================================
import {
  IFinanceStats,
  IInventoryStats,
  ITransactionStats,
  IAccountStats,
  IRefillStats,
  IStoreStats,
  StatsDateRange,
} from "./stats.js";

// ============================================================================
// Task Types
// ============================================================================
import { ITaskLean } from "./task.js";

/**
 * Main function to generate JSON schemas for all typeit types.
 * 
 * Generates comprehensive schemas using typia's json.application() which
 * creates OpenAPI 3.0 compatible schemas with proper $ref references.
 */
function main() {
  const outDir = join(process.cwd(), "schemas");
  mkdirSync(outDir, { recursive: true });

  console.log("Generating JSON schemas for typeit library...\n");

  // =========================================================================
  // Generate comprehensive schema with all types
  // Important: use HTTP<T> so bigint / Date are converted to strings for JSON
  // =========================================================================
  
  const jsonSchema = typia.json.application<[
    // -----------------------------------------------------------------------
    // Account Types - Core user account management
    // -----------------------------------------------------------------------
    /** Complete account object returned from API */
    HTTP<IAccount>,
    /** Form data for creating a new account */
    HTTP<IAccountBaseForm>,
    /** Form data for changing account password */
    HTTP<IAccountPasswordForm>,
    /** Form data for updating account settings (excluding password/role) */
    HTTP<IAccountSettingsForm>,
    /** User credentials for authentication */
    HTTP<ICredentials>,
    /** API key record */
    HTTP<IApiKey>,
    /** Form data for creating API keys */
    HTTP<IApiKeyCreateForm>,
    /** Form data for API key authentication */
    HTTP<IApiKeyAuthForm>,

    // -----------------------------------------------------------------------
    // Product Types - Product catalog management
    // -----------------------------------------------------------------------
    /** Generic product (can be either stock or order type) */
    HTTP<IProduct>,
    /** Stock-based product with inventory tracking */
    HTTP<IProduct<ProductTypes.Stock>>,
    /** Order-based product with supplier minimum quantities */
    HTTP<IProduct<ProductTypes.Order>>,
    /** Form data for creating/editing products (generic) */
    HTTP<IProductForm>,
    /** Form data for creating/editing stock products */
    HTTP<IProductForm<ProductTypes.Stock>>,
    /** Form data for creating/editing order products */
    HTTP<IProductForm<ProductTypes.Order>>,

    // -----------------------------------------------------------------------
    // Cart Types - Shopping cart functionality
    // -----------------------------------------------------------------------
    /** Shopping cart containing multiple cart items */
    HTTP<ICart>,
    /** Serialized cart for HTTP transmission */
    HTTP<ICartSerialized>,
    /** Individual cart item with product info and quantity */
    HTTP<ICartItem>,
    /** Serialized cart item for HTTP transmission */
    HTTP<ICartItemSerialized>,

    // -----------------------------------------------------------------------
    // Transaction Ledger Types - Financial transaction records
    // -----------------------------------------------------------------------
    /** Complete transaction record */
    HTTP<ITransaction>,
    /** Form data for creating new transactions */
    HTTP<ITransactionForm>,
    /** Individual item within a transaction */
    HTTP<ITransactionItem>,

    // -----------------------------------------------------------------------
    // Refill Ledger Types - Account refill/top-up operations
    // -----------------------------------------------------------------------
    /** Complete refill record */
    HTTP<IRefill>,
    /** Form data for initiating refill requests */
    HTTP<IRefillForm>,

    // -----------------------------------------------------------------------
    // Pre-order Ledger Types - Pre-order tracking for order-based products
    // -----------------------------------------------------------------------
    /** Complete pre-order record */
    HTTP<IPreOrder>,
    /** Form data for creating pre-orders */
    HTTP<IPreOrderForm>,

    // -----------------------------------------------------------------------
    // Stock Entry Ledger Types - Inventory movement tracking
    // -----------------------------------------------------------------------
    /** Generic stock entry (can be purchase, shrinkage, overage, or sale) */
    HTTP<IStockEntry>,
    /** Stock entry form data (generic) */
    HTTP<IStockEntryForm>,
    /** Purchase stock entry with cost tracking */
    HTTP<IStockEntry<StockEntryType.Purchase>>,
    /** Form for purchase entries with cost */
    HTTP<IStockEntryForm<StockEntryType.Purchase>>,
    /** Shrinkage stock entry (loss/damage) */
    HTTP<IStockEntry<StockEntryType.Shrinkage>>,
    /** Overage stock entry (found inventory) */
    HTTP<IStockEntry<StockEntryType.Overage>>,
    /** Sale stock entry (customer purchase) */
    HTTP<IStockEntry<StockEntryType.Sale>>,

    // -----------------------------------------------------------------------
    // Combined Ledger Types - Union types for all ledger operations
    // -----------------------------------------------------------------------
    /** Union of all ledger entry types */
    HTTP<ILedger>,
    /** Union of all ledger form types */
    HTTP<ILedgerForm>,

    // -----------------------------------------------------------------------
    // Error Types - Standardized error responses
    // -----------------------------------------------------------------------
    /** Standard error response format */
    HTTP<IError>,

    // -----------------------------------------------------------------------
    // Log Types - Application event logging
    // -----------------------------------------------------------------------
    /** Log entry for event tracking */
    HTTP<Log>,

    // -----------------------------------------------------------------------
    // Statistics Types - Analytics and reporting
    // -----------------------------------------------------------------------
    /** Financial metrics and statistics */
    HTTP<IFinanceStats>,
    /** Inventory statistics */
    HTTP<IInventoryStats>,
    /** Transaction count statistics by type */
    HTTP<ITransactionStats>,
    /** Account count statistics by role */
    HTTP<IAccountStats>,
    /** Refill count statistics by status */
    HTTP<IRefillStats>,
    /** Store performance statistics (rankings) */
    HTTP<IStoreStats>,

    // -----------------------------------------------------------------------
    // Task Types - Background task management
    // -----------------------------------------------------------------------
    /** Lightweight task information */
    HTTP<ITaskLean>,

    // -----------------------------------------------------------------------
    // Enums - All enumeration types for reference
    // -----------------------------------------------------------------------
    /** User account roles */
    Roles,
    /** Account form types (settings vs password) */
    AccountFormTypes,
    /** Product types (stock vs order) */
    ProductTypes,
    /** Product categories */
    ProductCategories,
    /** Transaction types (debit vs credit) */
    TransactionType,
    /** Payment methods for refills */
    RefillMethods,
    /** Refill processing statuses */
    RefillStatus,
    /** Pre-order lifecycle statuses */
    PreOrderStatus,
    /** Stock entry types (purchase, shrinkage, etc.) */
    StockEntryType,
    /** Ledger entry type discriminator */
    LedgerType,
    /** Date range options for statistics queries */
    StatsDateRange,
  ], "swagger", true>();

  // Schema titles/names in the same order as types above
  const schemaNames = [
    // Account Types
    "IAccount",
    "IAccountBaseForm",
    "IAccountPasswordForm",
    "IAccountSettingsForm",
    "ICredentials",
    "IApiKey",
    "IApiKeyCreateForm",
    "IApiKeyAuthForm",
    // Product Types
    "IProduct",
    "IProductStock",
    "IProductOrder",
    "IProductForm",
    "IProductFormStock",
    "IProductFormOrder",
    // Cart Types
    "ICart",
    "ICartSerialized",
    "ICartItem",
    "ICartItemSerialized",
    // Transaction Types
    "ITransaction",
    "ITransactionForm",
    "ITransactionItem",
    // Refill Types
    "IRefill",
    "IRefillForm",
    // PreOrder Types
    "IPreOrder",
    "IPreOrderForm",
    // Stock Entry Types
    "IStockEntry",
    "IStockEntryForm",
    "IStockEntryPurchase",
    "IStockEntryFormPurchase",
    "IStockEntryShrinkage",
    "IStockEntryOverage",
    "IStockEntrySale",
    // Combined Ledger Types
    "ILedger",
    "ILedgerForm",
    // Error Types
    "IError",
    // Log Types
    "Log",
    // Statistics Types
    "IFinanceStats",
    "IInventoryStats",
    "ITransactionStats",
    "IAccountStats",
    "IRefillStats",
    "IStoreStats",
    // Task Types
    "ITaskLean",
    // Enums (these appear as component schemas, not top-level)
    "Roles",
    "AccountFormTypes",
    "ProductTypes",
    "ProductCategories",
    "TransactionType",
    "RefillMethods",
    "RefillStatus",
    "PreOrderStatus",
    "StockEntryType",
    "LedgerType",
    "StatsDateRange",
  ];

  // Add titles to schemas for better identification
  const schemasWithTitles = jsonSchema.schemas.map((schema, index) => ({
    ...schema,
    title: schemaNames[index] || `Schema_${index}`,
    "$id": `#/schemas/${schemaNames[index] || `Schema_${index}`}`,
  }));

  // Add metadata to the schema
  const schemaWithMetadata = {
    openapi: "3.0.3",
    info: {
      title: "Typeit JSON Schemas",
      description: "JSON schemas for the typeit library - shared types for spendit and serveit applications. All bigint values are serialized as strings for JSON compatibility.",
      version: "1.0.0",
      license: {
        name: "AGPL-3.0",
        url: "https://www.gnu.org/licenses/agpl-3.0.en.html"
      }
    },
    schemas: schemasWithTitles,
    components: jsonSchema.components
  };

  // Write the combined schema file
  writeFileSync(
    join(outDir, "json-schema.json"),
    JSON.stringify(schemaWithMetadata, null, 2),
    "utf8",
  );

  console.log("✓ Generated: schemas/json-schema.json");
  console.log("\nSchema generation complete!");
  console.log(`\nOutput directory: ${outDir}`);
  
  // Print summary of generated schemas
  const schemaCount = jsonSchema.schemas.length;
  const componentCount = Object.keys(jsonSchema.components.schemas ?? {}).length;
  console.log(`\nGenerated ${schemaCount} top-level schemas`);
  console.log(`Generated ${componentCount} component schemas (enums, nested types)`);

  // Generate individual schema files for easier consumption
  const individualDir = join(outDir, "individual");
  mkdirSync(individualDir, { recursive: true });

  schemasWithTitles.forEach((schema, index) => {
    const schemaName = schemaNames[index] || `Schema_${index}`;
    // Create a copy without the existing $id, then add our own
    const { $id: _, ...schemaWithoutId } = schema as any;
    const individualSchema = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": `typeit/${schemaName}`,
      ...schemaWithoutId,
      // Include components for $ref resolution
      components: jsonSchema.components
    };

    writeFileSync(
      join(individualDir, `${schemaName}.json`),
      JSON.stringify(individualSchema, null, 2),
      "utf8"
    );
  });

  console.log(`\nGenerated ${schemasWithTitles.length} individual schema files in schemas/individual/`);
}

main();
