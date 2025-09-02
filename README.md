# typesit

A TypeScript shared library providing type definitions, interfaces, and runtime validation for the spendit and serveit applications. This library ensures type safety and consistency across the entire application ecosystem.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager

### Installing

Install the package via npm:

```bash
npm install typesit
```

Import types in your TypeScript project:

```typescript
import { IAccount, isIAccount, Roles } from 'typesit';

const account: IAccount = {
  id: 'acc_123',
  username: 'johndoe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: Roles.Member,
  balance: 2500n,
  notify: true
};

// Runtime validation
if (isIAccount(someData)) {
  console.log(`Welcome ${someData.firstName}!`);
}
```

### Core Features

- **Account Management**: User accounts with role-based permissions
- **Product System**: Support for both stock and order-based products
- **Shopping Cart**: Cart operations with quantity calculations
- **Ledger System**: Financial transactions, refills, stock movements, and pre-orders
- **Runtime Validation**: Type guards using typia for data validation
- **HTTP Serialization**: Automatic BigInt to string conversion for API transmission

## Running the tests

Run the test suite to verify everything is working correctly:

```bash
npm test
```

### Unit Tests

The library includes comprehensive unit tests for all type guards and validation functions:

```bash
npm test account.test.ts
```

### Coverage Reports

Generate test coverage reports:

```bash
npm test -- --coverage
```

## Development

### Building

Build the TypeScript library:

```bash
npm run build
```

Watch mode for development:

```bash
npm run watch
```

### Project Structure

```
src/
├── account.ts              # User accounts and authentication
├── cart.ts                 # Shopping cart functionality
├── common.ts               # Shared types and utilities
├── error.ts                # Error handling
├── index.ts                # Main exports
├── log.ts                  # Logging interfaces
├── product.ts              # Product management
├── stats.ts                # Statistics and analytics
├── task.ts                 # Background tasks
└── ledgers/
    ├── ledgers.ts          # Unified ledger system
    ├── preorders.ts        # Pre-order management
    ├── refill.ts           # Account refills
    ├── stock.ts            # Inventory tracking
    └── transaction.ts      # Financial transactions
```

## Built With

* [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
* [typia](https://github.com/samchon/typia) - Runtime type validation
* [Jest](https://jestjs.io/) - Testing framework
* [Mongoose](https://mongoosejs.com/) - MongoDB object modeling

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with proper documentation
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/jac4e/typeit/tags).

## Authors

* **Jacques Fourie** - *Initial work* - [jac4e](https://github.com/jac4e)
## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPL-3.0) - see the [LICENSE](LICENSE) file for details.
