import { describe, expect, it } from 'vitest';

import { isAdmin, toRole } from '@/domain/auth/user';

describe('toRole', () => {
  it('maps the stored string to a known role', () => {
    expect(toRole('admin')).toBe('admin');
    expect(toRole('user')).toBe('user');
  });

  it('treats anything unknown or missing as a plain user (never escalates)', () => {
    expect(toRole(null)).toBe('user');
    expect(toRole(undefined)).toBe('user');
    expect(toRole('')).toBe('user');
    expect(toRole('ADMIN')).toBe('user');
    expect(toRole('superadmin')).toBe('user');
  });
});

describe('isAdmin', () => {
  it('is true only for the admin role', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
    expect(isAdmin({ role: 'user' })).toBe(false);
  });
});
