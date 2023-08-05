import { WritableComputedRef, computed } from 'vue';
import { stringToBoolean } from '../services/conversionService';

export interface LocalSessionValue<T> {
  value: WritableComputedRef<T | null>;
  remove(): void;
}

abstract class BaseLocalSessionValue<T> implements LocalSessionValue<T> {
  protected key: string;
  public value: WritableComputedRef<T | null>;

  constructor(key: string) {
    this.key = key;

    this.value = computed({
      get: () => {
        const value = localStorage.getItem(this.key);

        if (value === null || value === undefined) {
          return null;
        }

        return this.getValue(value);
      },
      set: (value) => {
        if (value === undefined || value == null) {
          localStorage.removeItem(this.key);
          return;
        }

        this.setValue(value);
      }
    });
  }

  remove = (): void => {
    // Remove item from local storage
    localStorage.removeItem(this.key);
  };

  protected abstract getValue(value: string): T | null;
  protected abstract setValue(value: T): void;
}

class BoolLocalSessionValue extends BaseLocalSessionValue<boolean> {
  getValue(value: string): boolean | null {
    // Return the string value casted to a boolean
    return stringToBoolean(value);
  }

  setValue(value: boolean): void {
    // Update local storage
    localStorage.setItem(this.key, !!value ? 'true' : 'false');
  }
}

class IntLocalSessionValue extends BaseLocalSessionValue<number> {
  getValue(value: string): number | null {
    // Parse to integer
    const intValue = parseInt(value);

    // Invalid integer returns as null value
    if (isNaN(intValue)) {
      return null;
    }

    return intValue;
  }

  setValue(value: number): void {
    // Update local storage
    localStorage.setItem(this.key, value.toString());
  }
}

class StringLocalSessionValue extends BaseLocalSessionValue<string> {
  getValue(value: string): string | null {
    // The value is already a string so no need to do anything
    return value;
  }

  setValue(value: string): void {
    // Update local storage
    localStorage.setItem(this.key, value);
  }
}

export const useLocalSessionString = (key: string): LocalSessionValue<string> => new StringLocalSessionValue(key);
export const useLocalSessionBool = (key: string): LocalSessionValue<boolean> => new BoolLocalSessionValue(key);
export const useLocalSessionInt = (key: string): LocalSessionValue<number> => new IntLocalSessionValue(key);
