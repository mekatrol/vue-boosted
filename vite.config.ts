import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import vue from '@vitejs/plugin-vue';

const resolvePath = (str: string): string => resolve(__dirname, str);

export default defineConfig({
  plugins: [vue(), dts({ rollupTypes: true })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  esbuild: {
    minifyIdentifiers: false,
    keepNames: true
  },
  build: {
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'vue-boosted',
      fileName: (format, name) => {
        if (format === 'es') {
          return `${name}.js`;
        }

        return `${name}.cjs`;
      }
    },
    rollupOptions: {
      external: ['vue'],
      preserveEntrySignatures: 'strict',

      output: {
        exports: 'named',
        globals: {
          vue: 'Vue'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name ?? '';
        }
      }
    }
  }
});
