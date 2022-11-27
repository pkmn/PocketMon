import favicons from 'favicons';
import {parseFragment} from 'parse5';
import path from 'path';
import {PluginContext} from 'rollup';
import sharp from 'sharp';
import {fileURLToPath} from 'url';
import {defineConfig, HtmlTagDescriptor, Plugin, ResolvedConfig} from 'vite';
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

const MetaPlugin = (options: MetaPluginOptions): Plugin => {
  let config: ResolvedConfig;
  // let manifest: JsonObject;
  const resources = new Map<string, string | Buffer>;
  const tags: HtmlTag[] = [];

  const logo = path.resolve(path.join('public', 'logo.svg'));
  const preview = path.resolve(path.join('public', 'preview.png'));

  const generateFavicons = async () =>
    favicons(logo, {
      path: path.join(config.base, config.build.assetsDir),
      appName: options.name,
      appDescription: options.description,
      start_url: '/',
      manifestMaskable: logo,
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

  const rebuildFavicons = async (ctx: PluginContext) => {
    ctx.addWatchFile(logo);
    ctx.addWatchFile(preview);

    const generated = await generateFavicons();
    const resized = await generatePreview();

    const build = config.command === 'build';
    for (const {name, contents} of generated.files) {
      const fileName = path.join(config.build.assetsDir, name);
      // TODO: need to merge with vite-plugin-pwa output
      // if (name === 'manifest.webmanifest') {
      //   manifest = JSON.parse(contents);
      //   continue;
      // }
      resources.set(fileName, contents);
      if (build) ctx.emitFile({type: 'asset', fileName, source: contents});
    }
    for (const {name, contents} of generated.images) {
      const fileName = path.join(config.build.assetsDir, name);
      resources.set(fileName, contents);
      if (build) ctx.emitFile({type: 'asset', fileName, source: contents});
    }
    {
      const fileName = path.join(config.build.assetsDir, 'twitter.png');
      if (build) ctx.emitFile({type: 'asset', fileName, source: resized});
      resources.set(fileName, resized);
    }

    for (const tag of generated.html) {
      const node = parseFragment(tag).childNodes[0] as unknown as {
        nodeName: string;
        attrs: [{name: string; value: string}];
      };
      if (node.attrs.some(attr => attr.name === 'name' && attr.value === 'theme-color')) {
        continue;
      }
      // device- prefix is deprecated - itgalaxy/favicons#289
      tags.push(new HtmlTag(node.nodeName, node.attrs.reduce((acc, v) => {
        acc[v.name] = (node.nodeName === 'link' && v.name === 'media')
          ? v.value.replaceAll(/device-(width|height)/g, (_, g) => g)
          : v.value;
        return acc;
      }, {} as Record<string, string>)));
    }

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
      await rebuildFavicons(this);
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

export default defineConfig({
  clearScreen: false,
  plugins: [
    TSConfigPathsPlugin(),
    MetaPlugin({
      name: 'PocketMon',
      description: 'Mobile UI for competitive Pokémon battling',
      analytics: 'UA-180700059-1',
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
  esbuild: {
    jsxInject: 'import React from \'dom\'',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
