import { WritableComputedRef, computed } from 'vue';
import { stringToBoolean } from '../services/conversionService';

export const useLocalSessionString = (key: string, defaultValue?: string): WritableComputedRef<string> => {
  let local = localStorage.getItem(key) ?? `${defaultValue}`;

  // Wrap with proxy
  const useValue = computed({
    get: () => local,
    set: (value: string) => {
      local = value;
      localStorage.setItem(key, `${value}`);
    }
  });

  return useValue;
};

export const useLocalSessionBool = (key: string, defaultValue?: boolean): WritableComputedRef<boolean> => {
  const localString = localStorage.getItem(key) ?? `${defaultValue}`;
  let local = stringToBoolean(localString);

  // Wrap with proxy
  const useValue = computed({
    get: () => local,
    set: (value: boolean) => {
      local = value;
      localStorage.setItem(key, `${value}`);
    }
  });

  return useValue;
};

export const useLocalSessionInt = (key: string, defaultValue?: number): WritableComputedRef<number> => {
  const localString = localStorage.getItem(key);

  // Parse to integer value
  let local = parseInt(localString ?? '');

  // If parse failed then set to default value (or zero if default not set)
  if (isNaN(local)) {
    local = defaultValue ?? 0;
  }

  // Wrap with proxy
  const useValue = computed({
    get: () => local,
    set: (value: number) => {
      local = value;
      localStorage.setItem(key, `${value}`);
    }
  });

  return useValue;
};
