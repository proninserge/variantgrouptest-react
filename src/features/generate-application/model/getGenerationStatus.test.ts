import { describe, expect, it } from 'vitest';

import { getGenerationErrorMessage, getGenerationStatus } from './getGenerationStatus';

describe('getGenerationStatus', () => {
  it('returns "generating" when pending', () => {
    expect(getGenerationStatus(true, false, false)).toBe('generating');
  });

  it('returns "success" when succeeded', () => {
    expect(getGenerationStatus(false, true, false)).toBe('success');
  });

  it('returns "error" when failed', () => {
    expect(getGenerationStatus(false, false, true)).toBe('error');
  });

  it('returns "idle" in the initial state', () => {
    expect(getGenerationStatus(false, false, false)).toBe('idle');
  });

  it('prioritizes pending over terminal states', () => {
    expect(getGenerationStatus(true, true, false)).toBe('generating');
  });
});

describe('getGenerationErrorMessage', () => {
  it('returns null when there is no error', () => {
    expect(getGenerationErrorMessage(null)).toBeNull();
  });

  it('returns the error message', () => {
    expect(getGenerationErrorMessage(new Error('Network timeout'))).toBe('Network timeout');
  });

  it('falls back to a generic message', () => {
    expect(getGenerationErrorMessage(new Error(''))).toBe('Generation failed');
  });
});
