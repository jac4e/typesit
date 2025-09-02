import { IQuantity } from "./common";
import { IProduct, isIProduct, ProductTypes, ProductCategories } from "./product";

// type result = Product<ProductTypes.Stock>;
// const testresutls: result = {
//     id: '123',
//     category: ProductCategories.Food,
//     name: 'Apple',
//     description: 'A delicious apple',
//     image: 'apple.jpg',
//     price: 100n,
//     type: ProductTypes.Stock,
//     stock: 100n
//   }
  
//   const test = isProductType(ProductTypes.Stock, testresutls);

const correctProductBase = {
    id: "1234567890",
    category: ProductCategories.Food,
    name: "name",
    description: "description",
    image: "image",
    price: 100n
};

describe("isIProduct<AnyProduct>", () => {
    // AnyProduct Tests
    for (const type of [ProductTypes.Stock, ProductTypes.Order]) {
        const correctProductBase = {
            id: "1234567890",
            category: ProductCategories.Food,
            name: "name",
            description: "description",
            image: "image",
            price: 100n,
            type: type
        };

        const correctProductTypedProperties: {stock: IQuantity} | {order: {minimum: IQuantity, current: IQuantity}} = type === ProductTypes.Stock ? { stock: 100n } : { order: { minimum: 100n, current: 100n } };
        const nonMatchingProductTypedProperties: {stock: IQuantity} | {order: {minimum: IQuantity, current: IQuantity}} = type === ProductTypes.Order ? { stock: 100n } : { order: { minimum: 100n, current: 100n } };
        
        const incorrectProductTypedProperties_BadType = type === ProductTypes.Stock ?  { stock: false } : { order: { minimum: false, current: 100n } };
        const incorrectProductTypedProperties_ExtraProp = type === ProductTypes.Stock ? { stock: { extra: 'property' } } : { order: { minimum: 100n, current: 100n, extra: 'property' } };
        const incorrectProductTypedProperties_MissingProp = type === ProductTypes.Stock ? {  } : { order: { minimum: 100n } };

        it(`should return true if everything is valid`, () => {
            const product = {
                ...correctProductBase,
                ...correctProductTypedProperties
            };
            // console.log(product);
            expect(isIProduct(product)).toBe(true);
        });

        it(`should return false if ProductBase is missing required property`, () => {
            let product: any = {
                ...correctProductBase,
                ...correctProductTypedProperties
            };
            delete product.id;
            expect(isIProduct(product)).toBe(false);
        });

        it(`should return false if ProductBase has an extra property`, () => {
            const product = {
                ...correctProductBase,
                ...correctProductTypedProperties,
                extra: 'property'
            };
            expect(isIProduct(product)).toBe(false);
        });

        it(`should return false if ProductBase has an incorrect property`, () => {
            const product = {
                ...correctProductBase,
                ...correctProductTypedProperties,
                id: false
            };
            expect(isIProduct(product)).toBe(false);
        });

        it(`should return false if no ProductTypedProperties is provided`, () => {
            const product = {
                ...correctProductBase,
            };
            expect(isIProduct(product)).toBe(false);
        });

        it(`should return false if ProductTypedProperties does not match type specified by product`, () => {
            const product = {
                ...correctProductBase,
                ...nonMatchingProductTypedProperties
            };
            expect(isIProduct(product)).toBe(false);
        });

        it(`should return false if ProductTypedProperties is not structurally valid`, () => {
            const product_BadType = {
                ...correctProductBase,
                ...incorrectProductTypedProperties_BadType
            };
            expect(isIProduct(product_BadType)).toBe(false);

            const product_ExtraProp = {
                ...correctProductBase,
                ...incorrectProductTypedProperties_ExtraProp
            };
            expect(isIProduct(product_ExtraProp)).toBe(false);

            const product_MissingProp = {
                ...correctProductBase,
                ...incorrectProductTypedProperties_MissingProp
            };
            expect(isIProduct(product_MissingProp)).toBe(false);
        });
    }
});

describe("isIProduct<T extends ProductTypes>", () => {
    // Typed Product Tests
    const correctStockProduct = {
        id: "1234567890",
        category: ProductCategories.Food,
        name: "name",
        description: "description",
        image: "image",
        price: 100n,
        type: ProductTypes.Stock,
        stock: 100n
    };

    const correctOrderProduct = {
        id: "1234567890",
        category: ProductCategories.Food,
        name: "name",
        description: "description",
        image: "image",
        price: 100n,
        type: ProductTypes.Order,
        order: { minimum: 100n, current: 100n }
    };

    it(`should return true if everything is valid`, () => {
        expect(isIProduct(correctStockProduct, ProductTypes.Stock)).toBe(true);
        expect(isIProduct(correctOrderProduct, ProductTypes.Order)).toBe(true);
    });
    it(`should return false if ProductBase is missing required property`, () => {
        let productStock: any = {
            ...correctStockProduct
        };
        delete productStock.id;
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        let productOrder: any = {
            ...correctOrderProduct
        };
        delete productOrder.id;
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if ProductBase has an extra property`, () => {
        const productStock = {
            ...correctStockProduct,
            extra: 'property'
        };
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        const productOrder = {
            ...correctOrderProduct,
            extra: 'property'
        };
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if ProductBase has an incorrect property`, () => {
        const productStock = {
            ...correctStockProduct,
            id: false
        };
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        const productOrder = {
            ...correctOrderProduct,
            id: false
        };
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if no ProductTypedProperties is provided`, () => {
        let productStock: any = {
            ...correctStockProduct,
        };
        delete productStock.stock;
        // console.log(productStock);
        expect(isIProduct<ProductTypes.Stock>(productStock, ProductTypes.Stock)).toBe(false);
        let productOrder: any = {
            ...correctOrderProduct,
        };
        delete productOrder.order;
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if ProductTypedProperties does not match type specified by product`, () => {
        const productStock = {
            ...correctStockProduct,
            type: ProductTypes.Order,
        };
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        const productOrder = {
            ...correctOrderProduct,
            type: ProductTypes.Stock,
        };
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if ProductTypedProperties is not structurally valid`, () => {
        const productStock = {
            ...correctStockProduct,
            stock: false
        };
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        const productOrder = {
            ...correctOrderProduct,
            order: { minimum: false, current: 100n }
        };
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if ProductTypedProperties is missing a required property`, () => {
        let productStock: any = {
            ...correctStockProduct,
        };
        delete productStock.stock;
        expect(isIProduct(productStock, ProductTypes.Stock)).toBe(false);
        let productOrder: any = {
            ...correctOrderProduct,
        };
        delete productOrder.order.minimum;
        expect(isIProduct(productOrder, ProductTypes.Order)).toBe(false);
    });
    it(`should return false if the Product is of the wrong type than what is being checked`, () => {
        expect(isIProduct(correctStockProduct, ProductTypes.Order)).toBe(false);
        expect(isIProduct(correctOrderProduct, ProductTypes.Stock)).toBe(false);
    });
});
