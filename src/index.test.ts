/**
 * @fileoverview Test suite for index module utility functions.
 */

import { getKeys, getValues, getObject } from './index';
import { IAccount, Roles } from './account';

describe('Index Module Utilities', () => {
  describe('getKeys function', () => {
    it('should return keys for a simple object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const keys = getKeys(testAccount);
      expect(keys).toContain('id');
      expect(keys).toContain('username');
      expect(keys).toContain('balance');
    });

    it('should return empty array for empty object', () => {
      const keys = getKeys({} as any);
      expect(keys).toEqual([]);
    });
  });

  describe('getValues function', () => {
    it('should return values for an account object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456', 
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const values = getValues(testAccount);
      expect(values).toContain('123');
      expect(values).toContain('testuser');
      expect(values).toContain(true);
    });

    it('should return empty array for empty object', () => {
      const values = getValues({} as any);
      expect(values).toEqual([]);
    });
  });

  describe('getObject function', () => {
    it('should create key-value pairs from an account object', () => {
      const testAccount: IAccount = {
        id: '123',
        gid: '456',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: Roles.Member,
        balance: 1000n,
        notify: true
      };
      
      const objects = getObject(testAccount);
      expect(objects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ key: 'id', value: '123' }),
          expect.objectContaining({ key: 'username', value: 'testuser' }),
          expect.objectContaining({ key: 'notify', value: true })
        ])
      );
    });

    it('should handle empty object gracefully', () => {
      const objects = getObject({} as any);
      expect(objects).toEqual([]);
    });
  });

  describe('BigInt serialization', () => {
    it('should serialize BigInt values to strings', () => {
      const data = { amount: 1000n };
      const jsonString = JSON.stringify(data);
      expect(jsonString).toBe('{"amount":"1000"}');
    });

    it('should handle BigInt in complex objects', () => {
      const complexData = {
        name: 'test',
        balance: 2500n,
        active: true
      };
      const jsonString = JSON.stringify(complexData);
      expect(jsonString).toBe('{"name":"test","balance":"2500","active":true}');
    });
  });
});