import { describe, expect, it } from 'vitest';

import { DomainError } from '@/domain/shared/errors';

class SampleError extends DomainError {
  constructor() {
    super('boom', 'SAMPLE');
  }
}

describe('DomainError', () => {
  it('is an Error with a stable code and the subclass name', () => {
    const err = new SampleError();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(DomainError);
    expect(err.code).toBe('SAMPLE');
    expect(err.name).toBe('SampleError');
    expect(err.message).toBe('boom');
  });
});
