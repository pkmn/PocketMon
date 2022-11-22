import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';

const NODE_MODULES = '/node_modules/';

const root = dirname(fileURLToPath(import.meta.url));
const parent = dirname(root);

export default defineConfig({
  build: {
    chunkSizeWarningLimit: Infinity,
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code !== 'EVAL') warn(warning);
      },
      output: {
        manualChunks: id => {
          let index = id.indexOf(NODE_MODULES);
          if (index > 1) {
            id = id.slice(index + NODE_MODULES.length);
            index = id.indexOf('/');
            return (id.startsWith('@')
              ? `${id.slice(1, index)}.${id.slice(index + 1, id.indexOf('/', index + 1))}`
              : id.slice(0, index));
          }
          if (!(id.startsWith(root) || id.startsWith('vite'))) {
            if (!id.startsWith(parent)) throw new Error(`Unexpected module ${id}`);
            id = id.slice(parent.length + 1);
            index = id.indexOf('/');
            const dir = id.slice(0, index);
            const subdir = id.slice(index + 1, id.indexOf('/', index + 1));
            return ['build', 'dist'].includes(subdir) ? dir : `${dir}.${subdir}`;
          }
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
