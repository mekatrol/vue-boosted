import { describe, expect, it } from 'vitest';
import { stringToBoolean, booleanToString } from './conversionService';

describe('stringToBoolean', () => {
  it('undefined string returns false', () => {
    expect(stringToBoolean()).toBe(false);
  });
});

describe('booleanToString', () => {
  it('undefined string returns false', () => {
    expect(booleanToString(false)).toBe('false');
  });
});
