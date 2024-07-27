import { describe, expect, it } from 'vitest';
import { useLocalStorageMock } from '../tests/local-storage-mock';
import { useLocalSessionString } from '../composables/local-session';

const mockLocalStorage = useLocalStorageMock();

describe('useLocalSessionString', () => {
  it('no local storage key/value for key equals null', () => {
    const ls = useLocalSessionString('key');

    // localStorage with key 'key' has not been set
    expect(ls.setting).toBe(null);
  });

  it('empty value equals empty string', () => {
    mockLocalStorage.setItem('key', '');
    const ls = useLocalSessionString('key');
    expect(ls.setting).toBe('');
  });

  it('string value equals string', () => {
    mockLocalStorage.setItem('key', 'string');
    const ls = useLocalSessionString('key');
    expect(mockLocalStorage.getItem('key')).toBe('string');
    expect(ls.setting).toBe('string');
  });

  it('a different key', () => {
    const ls = useLocalSessionString('key2');
    expect(ls.setting).toBe(null);

    ls.setting = 'different';

    expect(mockLocalStorage.getItem('key2')).toBe('different');
    expect(ls.setting).toBe('different');
  });

  it('remove a key', () => {
    mockLocalStorage.setItem('key', 'remove');
    const ls = useLocalSessionString('key');
    expect(ls.setting).toBe('remove');
    ls.remove();
    expect(mockLocalStorage.getItem('key')).toBe(null);
    expect(ls.setting).toBe(null);
  });
});
