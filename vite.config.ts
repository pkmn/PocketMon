import {dirname} from 'path';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';

const NODE_MODULES = '/node_modules/';

const __dirname = dirname(fileURLToPath(import.meta.url));
const parent = dirname(__dirname);

export default defineConfig({
  build: {
    cssCodeSplit: false,
    sourcemap: false,
    chunkSizeWarningLimit: Infinity,
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
          if (!(id.startsWith(__dirname) || id.startsWith('vite'))) {
            if (!id.startsWith(parent)) throw new Error(`Unexpected module ${id}`);
            id = id.slice(parent.length + 1);
            index = id.indexOf('/');

            const dir = id.slice(0, index);
            switch (dir) {
            case '0-ERROR': case 'engine': case 'dmg': return `pkmn.${dir}`;
            default: return `pkmn.${id.slice(index + 1, id.indexOf('/', index + 1))}`;
            }
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
