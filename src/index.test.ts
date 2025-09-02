import { keys } from 'ts-transformer-keys';
import { getKeys, getValues, getObject, ProductTypes, ProductCategories, Roles, TransactionType, PreOrderStatus, StockEntryType } from './index';
import { IProduct, IAccount, ITransaction, IPreOrder, IStockEntry } from './index';

const date = new Date();
// increment date by one day
const date2 = new Date(date);
date2.setDate(date2.getDate() + 1);

const correctIProduct: IProduct<ProductTypes.Stock> = {
    id: "1234567890",
    category: ProductCategories.Food,
    name: "name",
    description: "description",
    image: "image",
    price: 100n,
    type: ProductTypes.Stock,
    stock: 50n
};

const expectedIProductKeys = [
    'id',
    'category',
    'name',
    'description',
    'image',
    'price',
    'type',
    'stock'
];

const expectedIProductValues = [
    "1234567890",
    ProductCategories.Food,
    "name",
    "description",
    "image",
    100n,
    ProductTypes.Stock,
    50n
];

const expectedIProductObjects = [
    { key: 'id', value: "1234567890" },
    { key: 'category', value: ProductCategories.Food },
    { key: 'name', value: "name" },
    { key: 'description', value: "description" },
    { key: 'image', value: "image" },
    { key: 'price', value: 100n },
    { key: 'type', value: ProductTypes.Stock },
    { key: 'stock', value: 50n }
];

const correctIAccount: IAccount = {
    id: "1234567890",
    gid: "0987654321",
    username: "username",
    firstName: "first",
    lastName: "last",
    email: "email",
    role: Roles.Admin,
    balance: 100n,
    notify: true
};

const expectedIAccountKeys = [
    'id',
    'gid',
    'username',
    'firstName',
    'lastName',
    'email',
    'role',
    'balance',
    'notify'
];

const expectedIAccountValues = [
    "1234567890",
    "0987654321",
    "username",
    "first",
    "last",
    "email",
    Roles.Admin,
    100n,
    true
];

const expectedIAccountObjects = [
    { key: 'id', value: "1234567890" },
    { key: 'gid', value: "0987654321" },
    { key: 'username', value: "username" },
    { key: 'firstName', value: "first" },
    { key: 'lastName', value: "last" },
    { key: 'email', value: "email" },
    { key: 'role', value: Roles.Admin },
    { key: 'balance', value: 100n },
    { key: 'notify', value: true }
];

const correctITransaction: ITransaction = {
    date: date,
    id: "1234567890",
    accountId: "0987654321",
    type: TransactionType.Credit,
    reason: "reason",
    products: [],
    total: 100n
};

const expectedITransactionKeys = [
    'date',
    'id',
    'accountId',
    'type',
    'reason',
    'products',
    'total'
];

const expectedITransactionValues = [
    date,
    "1234567890",
    "0987654321",
    TransactionType.Credit,
    "reason",
    [],
    100n
];

const expectedITransactionObjects = [
    { key: 'date', value: date },
    { key: 'id', value: "1234567890" },
    { key: 'accountId', value: "0987654321" },
    { key: 'type', value: TransactionType.Credit },
    { key: 'reason', value: "reason" },
    { key: 'products', value: [] },
    { key: 'total', value: 100n }
];

const correctIPreOrder: IPreOrder = {
    date: date,
    lastUpdated: date2,
    id: "1234567890",
    accountId: "0987654321",
    productId: "0987654321",
    amount: 100n,
    status: PreOrderStatus.Fulfilled
};

const expectedIPreOrderKeys = [
    'date',
    'lastUpdated',
    'id',
    'accountId',
    'productId',
    'amount',
    'status'
];

const expectedIPreOrderValues = [
    date,
    date2,
    "1234567890",
    "0987654321",
    100n,
    PreOrderStatus.Fulfilled
];

const expectedIPreOrderObjects = [
    { key: 'date', value: date },
    { key: 'lastUpdated', value: date2 },
    { key: 'id', value: "1234567890" },
    { key: 'accountId', value: "0987654321" },
    { key: 'productId', value: "0987654321" },
    { key: 'amount', value: 100n },
    { key: 'status', value: PreOrderStatus.Fulfilled }
];

const correctIStockEntry: IStockEntry = {
    id: "1234567890",
    date: date,
    productId: "0987654321",
    cost: 100n,
    type: StockEntryType.Overage,
    delta: 10n,
    notes: "notes"
};

const expectedIStockEntryKeys = [
    'id',
    'date',
    'productId',
    'cost',
    'type',
    'delta',
    'notes'
];

const expectedIStockEntryValues = [
    "1234567890",
    date,
    "0987654321",
    100n,
    StockEntryType.Overage,
    10n,
    "notes"
];

const expectedIStockEntryObjects = [
    { key: 'id', value: "1234567890" },
    { key: 'date', value: date },
    { key: 'productId', value: "0987654321" },
    { key: 'cost', value: 100n },
    { key: 'type', value: StockEntryType.Overage },
    { key: 'delta', value: 10n },
    { key: 'notes', value: "notes" }
];

const getAllPermutations = function (list: any[]): any[][] {
    // If there's only one item in the list, return the list
    if (list.length === 1) {
        return [list];
    }

    // Recursively get all permutations of the rest of the list
    let permutations = [];
    for (let i = 0; i < list.length; i++) {
        let rest = getAllPermutations(list.slice(0, i).concat(list.slice(i + 1)));
        for (let j = 0; j < rest.length; j++) {
            permutations.push([list[i]].concat(rest[j]));
        }
    }
    return permutations;
}

const createListEntry = function (name: string, correct: any, expectedKeys: string[], expectedValues: any[], expectedObjects: { key: string, value: any }[]) {
    // console.log(name, getAllPermutations(expectedKeys));
    return {
        name: name,
        keysPermutations: getAllPermutations(expectedKeys),
        valuesPermutations: getAllPermutations(expectedValues),
        objectsPermutations: getAllPermutations(expectedObjects),
        correct: correct,
        expectedKeys: expectedKeys,
        expectedValues: expectedValues,
        expectedObjects: expectedObjects
    };
}

const list = [
    createListEntry('IProduct', correctIProduct, expectedIProductKeys, expectedIProductValues, expectedIProductObjects),
    createListEntry('IAccount', correctIAccount, expectedIAccountKeys, expectedIAccountValues, expectedIAccountObjects),
    createListEntry('ITransaction', correctITransaction, expectedITransactionKeys, expectedITransactionValues, expectedITransactionObjects),
    createListEntry('IPreOrder', correctIPreOrder, expectedIPreOrderKeys, expectedIPreOrderValues, expectedIPreOrderObjects),
    createListEntry('IStockEntry', correctIStockEntry, expectedIStockEntryKeys, expectedIStockEntryValues, expectedIStockEntryObjects)
];


describe.each(list)('getKeys $name', ({ name, keysPermutations, valuesPermutations, objectsPermutations, correct, expectedKeys, expectedValues, expectedObjects }) => {
    // Test that getKeys returns a value that is unique
    it('Uniqueness', () => {
        // Find all permutations that match the correct keys
        const getKeysPermutations = keysPermutations.filter((permutation: string[]) => {
            // return getKeys(correct) === permutation;
            return getKeys(correct).toString() === permutation.toString();
        });

        const correctPermutations = keysPermutations.filter((permutation: string[]) => {
            return permutation.toString() === expectedKeys.toString();
        });

        // Expect the getKeys permutations to be 1
        expect(getKeysPermutations.length).toBe(1);

        // Expect the correct permutations to be 1
        expect(correctPermutations.length).toBe(1);
    });

    // Test that getKeys returns the correct value
    it('getKeys is Correct', () => {
        expect(getKeys(correct)).toEqual(expectedKeys);
    });
});

const compareArrays = function (a: any[], b: any[]): boolean {
    if (a.length !== b.length) {
      return false;
    }
  
    for (let i = 0; i < a.length; i++) {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) {
        return false;
      }
    }

    return true;
  }

describe.each(list)('getValues $name', ({ name, keysPermutations, valuesPermutations, objectsPermutations, correct, expectedKeys, expectedValues, expectedObjects }) => {
    // Test that getValues returns a value that is unique
    it('Uniqueness', () => {
        // Find all permutations that match the correct values
        const getValuesPermutations = valuesPermutations.filter((permutation: string[]) => {
            // return getValues(correct) === permutation;
            return compareArrays(getValues(correct), permutation);
        });

        const correctPermutations = valuesPermutations.filter((permutation: string[]) => {
            // return permutation === expectedValues;
            return compareArrays(permutation, expectedValues);
        });

        if (getValuesPermutations.length !== 1) {
            console.log(getValuesPermutations);
        }

        if (correctPermutations.length !== 1) {
            console.log(correctPermutations);
        }

        // Expect the getValues permutations to be 1
        expect(getValuesPermutations.length).toBe(1);

        // Expect the correct permutations to be 1
        expect(correctPermutations.length).toBe(1);
    });

    // Test that getValues returns the correct value
    it('getValues is Correct', () => {
        expect(getValues(correct)).toEqual(expectedValues);
    });
});

describe.each(list)('getObject $name', ({ name, keysPermutations, valuesPermutations, objectsPermutations, correct, expectedKeys, expectedValues, expectedObjects }) => {
    
    // Test that getObject returns a value that is unique
    it('Uniqueness', () => {
        // Find all permutations that match the correct objects
        const getObjectPermutations = objectsPermutations.filter((permutation: { key: string, value: any }[]) => {
            // return getObject(correct) === permutation;
            return compareArrays(getObject(correct), permutation);
        });

        const correctPermutations = objectsPermutations.filter((permutation: { key: string, value: any }[]) => {
            // return permutation === expectedObjects;
            return compareArrays(permutation, expectedObjects);
        });

        // Expect the getObject permutations to be 1
        expect(getObjectPermutations.length).toBe(1);

        // Expect the correct permutations to be 1
        expect(correctPermutations.length).toBe(1);
    });

    // Test that getObject returns the correct value
    it('getObject is Correct', () => {
        expect(getObject(correct)).toEqual(expectedObjects);
    });
});