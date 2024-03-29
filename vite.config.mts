import path from 'path';
import {fileURLToPath} from 'url';

import react from '@vitejs/plugin-react';
import favicons from 'favicons';
import {parseFragment} from 'parse5';
import {PluginContext} from 'rollup';
import sharp from 'sharp';
import {HtmlTagDescriptor, Plugin, ResolvedConfig, defineConfig} from 'vite';
import TSConfigPathsPlugin from 'vite-tsconfig-paths';

const NODE_MODULES = '/node_modules/';

const root = path.dirname(fileURLToPath(import.meta.url));
const parent = path.dirname(root);

class HtmlTag implements HtmlTagDescriptor {
  tag: string;
  attrs: Record<string, string | boolean>;
  children: string | HtmlTag[];

  constructor(
    tag: string,
    attrs: Record<string, string | boolean>,
    children: string | HtmlTag[] = [],
  ) {
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
  }
}

interface JsonObject{ [key: string]: AnyJson }
type JsonArray = Array<AnyJson>;
type AnyJson = boolean | number | string | null | JsonArray | JsonObject;

interface MetaPluginOptions {
  name: string;
  description: string;
  analytics: string;
  url: string;
}

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose: string;
}

// favicon-48x48.png - apparently not used by any browser
// mstile-144x144.png - deprecated in favor of browserconfig.xml
const SKIP_FILES = ['favicon-48x48.png', 'mstile-144x144.png'];

// favicon.ico - implicit
// apple-touch-icon - implicit, Apple will search for the appropriate one
// theme-color - replaced by a different theme color per color-scheme
const SKIP_TAGS = [...SKIP_FILES, 'favicon.ico', 'apple-touch-icon', 'theme-color'];

const MetaPlugin = (options: MetaPluginOptions): Plugin => {
  let config: ResolvedConfig;
  // let manifest: JsonObject;
  const resources = new Map<string, string | Buffer>;
  const tags: HtmlTag[] = [];
  tags.push(new HtmlTag('meta', {charset: 'utf-8'}));
  tags.push(new HtmlTag('meta',
    {name: 'viewport', content: 'minimum-scale=1, initial-scale=1, width=device-width'}));
  tags.push(new HtmlTag('link', {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}));

  const logo = path.resolve(path.join('public', 'favicon.svg'));
  const preview = path.resolve(path.join('public', 'preview.png'));

  const generateFavicons = async () =>
    favicons(logo, {
      path: path.join(config.base, config.build.assetsDir),
      appName: options.name,
      appDescription: options.description,
      start_url: '/',
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        favicons: true,
        windows: true,
        yandex: false,
      },
    });

  const generatePreview = async () => {
    const {data, info} = await sharp(preview)
      .resize({width: 1200, height: 630, fit: 'inside'})
      .toBuffer({resolveWithObject: true});

    const width = Math.floor((1200 - info.width) / 2);
    const height = Math.floor((630 - info.height) / 2);

    return sharp(data).extend({
      top: height,
      bottom: height,
      left: width,
      right: width,
      background: 'transparent',
    }).toBuffer();
  };

  const generate = async (ctx: PluginContext) => {
    ctx.addWatchFile(logo);
    ctx.addWatchFile(preview);

    const build = config.command === 'build';

    const generated = await generateFavicons();
    for (let {name, contents} of generated.files) {
      const fileName = path.join(config.build.assetsDir, name);
      if (name === 'manifest.webmanifest') {
        const json = JSON.parse(contents) as {icons: ManifestIcon[]};
        // favicons' default orientation "any" doesn't seem to respect orientation lock
        delete (json as any).orientation;
        json.icons = [{
          'src': '/favicon.svg',
          'sizes': 'any',
          'type': 'image/svg+xml',
          'purpose': 'any',
        }, ...json.icons.filter(icon => icon.sizes === '192x192' || icon.sizes === '512x512')];
        contents = JSON.stringify(json, null, 2);
        // TODO: need to merge with vite-plugin-pwa output
        // manifest = contents;
        // continue;
      }
      resources.set(fileName, contents);
      if (build) ctx.emitFile({type: 'asset', fileName, source: contents});
    }
    for (const {name, contents} of generated.images) {
      const fileName = path.join(config.build.assetsDir, name);
      if (SKIP_FILES.includes(fileName) ||
        (fileName.startsWith('android-chrome') &&
        !(fileName.endsWith('192.png') || fileName.endsWith('512.png')))) {
        continue;
      }
      resources.set(fileName, contents);
      if (build) ctx.emitFile({type: 'asset', fileName, source: contents});
    }
    {
      const source = await generatePreview();
      const fileName = path.join(config.build.assetsDir, 'twitter.png');
      if (build) ctx.emitFile({type: 'asset', fileName, source});
      resources.set(fileName, source);
    }

    for (const tag of generated.html) {
      if (SKIP_TAGS.some(skip => tag.includes(skip))) continue;

      const node = parseFragment(tag).childNodes[0] as unknown as {
        nodeName: string;
        attrs: [{name: string; value: string}];
      };

      // device- prefix is deprecated - itgalaxy/favicons#289
      tags.push(new HtmlTag(node.nodeName, node.attrs.reduce((acc, v) => {
        acc[v.name] = (node.nodeName === 'link' && v.name === 'media')
          ? v.value.replaceAll(/device-(width|height)/g, (_, g) => g)
          : v.value;
        return acc;
      }, {} as Record<string, string>)));
    }
    tags.push(new HtmlTag('link',
      {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'}));
    tags.push(new HtmlTag('meta', {name: 'description', content: options.description}));
    tags.push(new HtmlTag('meta', {name: 'color-scheme', content: 'light dark'}));
    tags.push(new HtmlTag('meta',
      {name: 'theme-color', content: '#fff', media: '(prefers-color-scheme: light)'}));
    tags.push(new HtmlTag('meta',
      {name: 'theme-color', content: '#121212', media: '(prefers-color-scheme: dark)'}));
    tags.push(new HtmlTag('meta', {property: 'og:type', content: 'website'}));
    tags.push(new HtmlTag('meta', {property: 'og:title', content: options.name}));
    tags.push(new HtmlTag('meta', {property: 'og:description', content: options.description}));
    tags.push(new HtmlTag('meta', {property: 'og:image', content: `${options.url}/preview.png`}));
    tags.push(new HtmlTag('meta', {name: 'twitter:card', content: 'summary_large_image'}));
    tags.push(new HtmlTag('meta', {name: 'twitter:image', content: `${options.url}/twitter.png`}));
    tags.push(new HtmlTag('script',
      {async: true, src: `https://www.googletagmanager.com/gtag/js?id=${options.analytics}`}));
    tags.push(new HtmlTag('script', {}, `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${options.analytics}');\n    `));
  };

  const getContentType = (url: string) => {
    switch (path.extname(url)) {
      case '.webmanifest': return 'application/json';
      case '.xml': return 'application/xml';
      case '.ico': return 'image/x-icon';
      case '.png': return 'image/png';
      default: throw new Error(`Unknown content type for URL: ${url}`);
    }
  };

  return {
    name: 'meta-plugin',
    configResolved(resolved: ResolvedConfig) {
      config = resolved;
    },
    async buildStart() {
      if (config.root === root) await generate(this);
    },
    transformIndexHtml() {
      return tags;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const resource = req.url && resources.get(req.url.slice(1));
        if (!resource) return next();
        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(req.url!));
        res.write(resource);
        res.end();
      });
    },
  };
};

const chunk = (file: string, base: string) => {
  if (base.startsWith('ps.')) base = `pkmn.${base.slice(3)}`;
  if (base !== 'pkmn.sim') return base;
  // Learnsets are very large and change infrequently
  if (file.includes('learnsets')) return `${base}.learnsets`;
  // Legality information changes more frequently though is still relatively stable
  if (file.includes('data/legality')) return `${base}.legality`;
  if (!file.includes('data') || file.includes('dex-data')) return base;
  // Descriptions usually all get changed together when Marty updates them
  if (file.includes('text')) return `${base}.text`;
  // config/formats and data/formats-data change daily if not weekly as tier updates occur
  if (file.includes('data/formats') || file.includes('config/formats')) return `${base}.formats`;
  // The sim/ root directory - core Dex/Battle code
  if (!file.includes('data') || file.includes('dex-data')) return base;
  // Divide the old gens into approximately equal-sized chunks
  const m = /gen(\d)/.exec(file);
  return `${base}.${!m ? 'current.gen' : +m[1] <= 5 ? 'classic.gens' : 'modern.gens'}`;
};

export default defineConfig({
  plugins: [
    react({jsxRuntime: 'classic'}).map(p =>
      // vite:react-refresh adds ['react', jsxImportDevRuntime, jsxImportRuntime] to optimizeDeps
      // which causes resolution errors during dev server startup because we don't use React
      (p && 'name' in p) && p.name === 'vite:react-refresh' ? {...p, config: c => {
        const original = (p as any).config(c);
        delete original.optimizeDeps;
        return original;
      }} : p),
    TSConfigPathsPlugin(),
    MetaPlugin({
      name: 'PocketMon',
      description: 'Modern UI for competitive Pokémon battling',
      analytics: 'G-DJ2METW58E',
      url: 'https://play.pkmn.cc',
    }),
  ],
  build: {
    assetsDir: '.',
    chunkSizeWarningLimit: Infinity,
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code !== 'EVAL') warn(warning);
      },
      output: {
        entryFileNames: '[name].[hash].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash][extname]',
        manualChunks: id => {
          let index = id.indexOf(NODE_MODULES);
          if (index > 1) {
            id = id.slice(index + NODE_MODULES.length);
            index = id.indexOf('/');
            if (!id.startsWith('@')) return id.slice(0, index);
            const namespace = id.slice(1, index);
            return chunk(id, `${namespace}.${id.slice(index + 1, id.indexOf('/', index + 1))}`);
          }
          if (!(id.startsWith(root) || id[0] === '\0')) {
            if (!id.startsWith(parent)) throw new Error(`Unexpected module ${id}`);
            id = id.slice(parent.length + 1);
            index = id.indexOf('/');
            const dir = id.slice(0, index);
            const subdir = id.slice(index + 1, id.indexOf('/', index + 1));
            return ['build', 'dist'].includes(subdir) ? dir : chunk(id, `${dir}.${subdir}`);
          }
          return 'index';
        },
      },
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: 'import {h, Fragment} from \'dom\'',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
