import { describe, expect, it } from 'vitest';
import { useLocalStorageMock } from '../tests/local-storage-mock';
import { useLocalSessionJsonObject } from '../composables/local-session';

const mockLocalStorage = useLocalStorageMock();

describe('useLocalSessionJsonObject', () => {
  it('no local storage key/value for key equals null', () => {
    const ls = useLocalSessionJsonObject('json');
    expect(ls.setting).toBe(null);
  });

  it('empty value equals null', () => {
    mockLocalStorage.setItem('json', '');
    const ls = useLocalSessionJsonObject('json');
    expect(ls.setting).toBe(null);
  });

  interface TestObject {
    id: number;
    name: string;
  }

  it('an object read test', () => {
    mockLocalStorage.setItem('json', JSON.stringify({ id: 999, name: 'testObject' }));
    const ls = useLocalSessionJsonObject<TestObject>('json');

    expect(ls.setting).toBeTruthy();
    expect(ls.setting!.id).toBe(999);
    expect(ls.setting!.name).toBe('testObject');
  });

  it('an object write test', () => {
    const ls = useLocalSessionJsonObject<TestObject>('json');
    const testObject: TestObject = { id: 999, name: 'testObject' };

    ls.setting = testObject;

    const json = mockLocalStorage.getItem('json');
    expect(json).toBeTruthy();
    expect(json).toBe(JSON.stringify(testObject));
  });
});
