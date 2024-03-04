import { describe, expect, it } from 'vitest';
import { useLocalStorageMock } from '../tests/localStorageMock';
import { useLocalSessionBool } from '../composables/localSession';

const mockLocalStorage = useLocalStorageMock();

describe('useLocalSessionBool', () => {
  it('no local storage key/value for key equals null', () => {
    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(null);
  });

  it('empty value equals null', () => {
    mockLocalStorage.setItem('bool', '');
    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(null);
  });

  it('invalid value equals null', () => {
    mockLocalStorage.setItem('bool', '');
    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(null);
  });

  it('0 equals false', () => {
    mockLocalStorage.setItem('bool', '0');
    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(false);
  });

  it('false equals false', () => {
    mockLocalStorage.setItem('bool', 'false');
    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(false);
  });

  it('true equals true', () => {
    mockLocalStorage.setItem('bool', 'true');

    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(true);
  });

  it('1 equals true', () => {
    mockLocalStorage.setItem('bool', '1');

    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(true);
  });

  it('True equals true', () => {
    mockLocalStorage.setItem('bool', 'True');

    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(true);
  });

  it('TRUE equals true', () => {
    mockLocalStorage.setItem('bool', 'TRUE');

    const ls = useLocalSessionBool('bool');
    expect(ls.setting).toBe(true);
  });
});
