import { describe, expect, it } from 'vitest';
import { useLocalStorageMock } from '../tests/localStorageMock';
import { useLocalSessionInt } from '../composables/localSession';

const mockLocalStorage = useLocalStorageMock();

describe('useLocalSessionInt', () => {
  it('no local storage key/value for key equals null', () => {
    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(null);
  });

  it('empty value equals null', () => {
    mockLocalStorage.setItem('int', '');
    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(null);
  });

  it('0 value equals 0', () => {
    mockLocalStorage.setItem('int', '0');
    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(0);
  });

  it('-1 value equals -1', () => {
    mockLocalStorage.setItem('int', '-1');
    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(-1);
  });

  it('0.5 value equals 0', () => {
    mockLocalStorage.setItem('int', '0.5');
    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(0);
  });

  it('non number string equals null', () => {
    mockLocalStorage.setItem('int', 'string');

    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(null);
  });

  it('1 value equals 1', () => {
    mockLocalStorage.setItem('int', '1');

    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(1);
  });

  it('08 value equals 8 (ensures radix set to 10)', () => {
    mockLocalStorage.setItem('int', '08');

    const ls = useLocalSessionInt('int');
    expect(ls.setting).toBe(8);
  });
});
