/**
 * @fileoverview Comprehensive test suite for account module.
 * Tests all type guards, edge cases, and validation logic.
 */

import { 
  IAccount, 
  ICredentials, 
  IAccountBaseForm, 
  IAccountSettingsForm, 
  IAccountPasswordForm,
  Roles,
  isIAccount,
  isICredentials,
  isIAccountBaseForm,
  isIAccountSettingsForm,
  isIAccountPasswordForm,
  keysIAccount
} from './account';

describe('Account Types and Validation', () => {
  // Test data constants
  const VALID_ACCOUNT: IAccount = {
    id: 'acc_123456789',
    gid: 'google_123456789',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'johndoe@example.com',
    role: Roles.Member,
    balance: 1000n,
    notify: true,
  };

  const VALID_CREDENTIALS: ICredentials = {
    username: 'johndoe',
    password: 'SecurePassword123!',
  };

  const VALID_ACCOUNT_BASE_FORM: IAccountBaseForm = {
    username: 'newuser',
    firstName: 'New',
    lastName: 'User',
    email: 'newuser@example.com',
    role: Roles.Unverified,
    notify: false,
    password: 'SecurePassword123!',
  };

  const VALID_ACCOUNT_SETTINGS_FORM: IAccountSettingsForm = {
    username: 'updateduser',
    firstName: 'Updated',
    lastName: 'User',
    email: 'updated@example.com',
    notify: true,
  };

  const VALID_PASSWORD_FORM: IAccountPasswordForm = {
    password: 'NewSecurePassword123!',
  };

  describe('Roles enum', () => {
    it('should have correct role values', () => {
      expect(Roles.Unverified).toBe('unverified');
      expect(Roles.Member).toBe('member');
      expect(Roles.NonMember).toBe('nonMember');
      expect(Roles.Admin).toBe('admin');
    });
  });

  describe('keysIAccount', () => {
    it('should contain all IAccount keys in correct order', () => {
      const expectedKeys = ['id', 'gid', 'username', 'firstName', 'lastName', 'email', 'role', 'balance', 'notify'];
      expect(keysIAccount).toEqual(expectedKeys);
    });
  });

  describe('isIAccount type guard', () => {
    it('should return true for valid IAccount with all properties', () => {
      expect(isIAccount(VALID_ACCOUNT)).toBe(true);
    });

    it('should return true for valid IAccount without optional gid', () => {
      const accountWithoutGid = { ...VALID_ACCOUNT, gid: undefined };
      expect(isIAccount(accountWithoutGid)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_ACCOUNT, id: undefined },
        { ...VALID_ACCOUNT, username: undefined },
        { ...VALID_ACCOUNT, firstName: undefined },
        { ...VALID_ACCOUNT, lastName: undefined },
        { ...VALID_ACCOUNT, email: undefined },
        { ...VALID_ACCOUNT, role: undefined },
        { ...VALID_ACCOUNT, balance: undefined },
        { ...VALID_ACCOUNT, notify: undefined },
      ];

      testCases.forEach((testCase, index) => {
        expect(isIAccount(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      const testCases = [
        { ...VALID_ACCOUNT, id: 123 },
        { ...VALID_ACCOUNT, gid: 123 },
        { ...VALID_ACCOUNT, username: 123 },
        { ...VALID_ACCOUNT, firstName: 123 },
        { ...VALID_ACCOUNT, lastName: 123 },
        { ...VALID_ACCOUNT, email: 123 },
        { ...VALID_ACCOUNT, role: 'invalid_role' },
        { ...VALID_ACCOUNT, balance: '1000' },
        { ...VALID_ACCOUNT, notify: 'true' },
      ];

      testCases.forEach((testCase) => {
        expect(isIAccount(testCase)).toBe(false);
      });
    });

    it('should return false for invalid role values', () => {
      const testCases = [
        { ...VALID_ACCOUNT, role: 'superuser' },
        { ...VALID_ACCOUNT, role: 'guest' },
        { ...VALID_ACCOUNT, role: '' },
        { ...VALID_ACCOUNT, role: null },
      ];

      testCases.forEach((testCase) => {
        expect(isIAccount(testCase)).toBe(false);
      });
    });

    it('should return false for extra properties', () => {
      const accountWithExtra = { ...VALID_ACCOUNT, extraProperty: 'extra' };
      expect(isIAccount(accountWithExtra)).toBe(false);
    });

    it('should return false for null, undefined, or primitive values', () => {
      expect(isIAccount(null)).toBe(false);
      expect(isIAccount(undefined)).toBe(false);
      expect(isIAccount('string')).toBe(false);
      expect(isIAccount(123)).toBe(false);
      expect(isIAccount([])).toBe(false);
    });
  });

  describe('isICredentials type guard', () => {
    it('should return true for valid credentials', () => {
      expect(isICredentials(VALID_CREDENTIALS)).toBe(true);
    });

    it('should return false for missing properties', () => {
      expect(isICredentials({ username: 'user' })).toBe(false);
      expect(isICredentials({ password: 'pass' })).toBe(false);
      expect(isICredentials({})).toBe(false);
    });

    it('should return false for invalid property types', () => {
      expect(isICredentials({ username: 123, password: 'pass' })).toBe(false);
      expect(isICredentials({ username: 'user', password: 123 })).toBe(false);
    });

    it('should return false for extra properties', () => {
      const credentialsWithExtra = { ...VALID_CREDENTIALS, extra: 'property' };
      expect(isICredentials(credentialsWithExtra)).toBe(false);
    });
  });

  describe('isIAccountBaseForm type guard', () => {
    it('should return true for valid account base form', () => {
      expect(isIAccountBaseForm(VALID_ACCOUNT_BASE_FORM)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_ACCOUNT_BASE_FORM, username: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, firstName: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, lastName: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, email: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, role: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, notify: undefined },
        { ...VALID_ACCOUNT_BASE_FORM, password: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isIAccountBaseForm(testCase)).toBe(false);
      });
    });

    it('should return false for invalid property types', () => {
      const testCases = [
        { ...VALID_ACCOUNT_BASE_FORM, username: 123 },
        { ...VALID_ACCOUNT_BASE_FORM, role: 'invalid_role' },
        { ...VALID_ACCOUNT_BASE_FORM, notify: 'true' },
        { ...VALID_ACCOUNT_BASE_FORM, password: 123 },
      ];

      testCases.forEach((testCase) => {
        expect(isIAccountBaseForm(testCase)).toBe(false);
      });
    });

    it('should return false if it contains excluded properties', () => {
      const formWithId = { ...VALID_ACCOUNT_BASE_FORM, id: 'should_not_be_here' };
      const formWithBalance = { ...VALID_ACCOUNT_BASE_FORM, balance: 1000n };
      const formWithGid = { ...VALID_ACCOUNT_BASE_FORM, gid: 'google_123' };

      expect(isIAccountBaseForm(formWithId)).toBe(false);
      expect(isIAccountBaseForm(formWithBalance)).toBe(false);
      expect(isIAccountBaseForm(formWithGid)).toBe(false);
    });
  });

  describe('isIAccountSettingsForm type guard', () => {
    it('should return true for valid account settings form', () => {
      expect(isIAccountSettingsForm(VALID_ACCOUNT_SETTINGS_FORM)).toBe(true);
    });

    it('should return false for missing required properties', () => {
      const testCases = [
        { ...VALID_ACCOUNT_SETTINGS_FORM, username: undefined },
        { ...VALID_ACCOUNT_SETTINGS_FORM, firstName: undefined },
        { ...VALID_ACCOUNT_SETTINGS_FORM, lastName: undefined },
        { ...VALID_ACCOUNT_SETTINGS_FORM, email: undefined },
        { ...VALID_ACCOUNT_SETTINGS_FORM, notify: undefined },
      ];

      testCases.forEach((testCase) => {
        expect(isIAccountSettingsForm(testCase)).toBe(false);
      });
    });

    it('should return false if it contains excluded properties', () => {
      const formWithRole = { ...VALID_ACCOUNT_SETTINGS_FORM, role: Roles.Member };
      const formWithPassword = { ...VALID_ACCOUNT_SETTINGS_FORM, password: 'secret' };

      expect(isIAccountSettingsForm(formWithRole)).toBe(false);
      expect(isIAccountSettingsForm(formWithPassword)).toBe(false);
    });
  });

  describe('isIAccountPasswordForm type guard', () => {
    it('should return true for valid password form', () => {
      expect(isIAccountPasswordForm(VALID_PASSWORD_FORM)).toBe(true);
    });

    it('should return false for missing password', () => {
      expect(isIAccountPasswordForm({})).toBe(false);
      expect(isIAccountPasswordForm({ password: undefined })).toBe(false);
    });

    it('should return false for invalid password type', () => {
      expect(isIAccountPasswordForm({ password: 123 })).toBe(false);
      expect(isIAccountPasswordForm({ password: null })).toBe(false);
    });

    it('should return false for extra properties', () => {
      const formWithExtra = { ...VALID_PASSWORD_FORM, extra: 'property' };
      expect(isIAccountPasswordForm(formWithExtra)).toBe(false);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle empty strings appropriately', () => {
      const accountWithEmptyStrings = {
        ...VALID_ACCOUNT,
        username: '',
        firstName: '',
        lastName: '',
        email: '',
      };
      expect(isIAccount(accountWithEmptyStrings)).toBe(true);
    });

    it('should handle zero balance', () => {
      const accountWithZeroBalance = { ...VALID_ACCOUNT, balance: 0n };
      expect(isIAccount(accountWithZeroBalance)).toBe(true);
    });

    it('should handle negative balance', () => {
      const accountWithNegativeBalance = { ...VALID_ACCOUNT, balance: -100n };
      expect(isIAccount(accountWithNegativeBalance)).toBe(true);
    });

    it('should handle large BigInt values', () => {
      const accountWithLargeBalance = { ...VALID_ACCOUNT, balance: BigInt(Number.MAX_SAFE_INTEGER) * 2n };
      expect(isIAccount(accountWithLargeBalance)).toBe(true);
    });
  });
});