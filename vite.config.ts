import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true })
  ],
  build: {
    // sourcemap: true,
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.tsx'),
      },
      formats: ['es', 'cjs'],
      name: 'ReactInfiniteScroll',
      fileName: (format, entryName) => format === 'es' ? `${entryName}.js` : `${entryName}.${format}.js`
    },
    rollupOptions: {
      external: ['react','react/jsx-runtime'],
      output: {
        exports: "named"
      }
    }
  },
});