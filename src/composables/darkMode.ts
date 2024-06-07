import { Ref, ref } from 'vue';

export const useOSDarkMode = (): Ref<boolean> => {
  const isDarkMode = ref(false);

  // Set initial value from OS setting
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
  }

  // Watch for changes to OS setting
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    isDarkMode.value = !!event.matches;
  });

  return isDarkMode;
};
