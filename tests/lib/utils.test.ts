import { describe, expect, it } from 'vitest';

import { cn, formatBytes, safeNextPath } from '@/lib/utils';

describe('cn', () => {
  it('joins classes and drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('lets the last Tailwind utility win on conflicts', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatBytes', () => {
  it.each([
    [512, '512 B'],
    [2048, '2 KB'],
    [1536 * 1024, '1.5 MB'],
  ])('%d → %s', (bytes, expected) => {
    expect(formatBytes(bytes)).toBe(expected);
  });
});

describe('safeNextPath', () => {
  it('keeps same-site paths', () => {
    expect(safeNextPath('/admin/productos')).toBe('/admin/productos');
  });

  it.each(['https://evil.test', '//evil.test', '/\\evil.test', '', undefined])('rejects %s', (value) => {
    expect(safeNextPath(value, '/admin')).toBe('/admin');
  });
});
