# TODO

- [Service Worker](https://vite-pwa-org.netlify.app/)
  - [`workbox`](https://developer.chrome.com/docs/workbox/)
- UI framework
  - restore page on reload
- Assets Management
  - preload
  - settings UI
  - add/delete
- [Accessibility](https://wave.webaim.org/)

## Images

- images contains hash abbrev of pkmn/sprites
- images contains data for each *source* (directory level)
- fetch last index, compare hashes, if same do nothing
- write `{filepath: size}` of each changed
- do `git diff --name-only last..HEAD` to get what to
- set `fetch-depth: 0` on `actions/checkout@v3` for full history
- prune diffs only to last N=10?

```ts
import * as child_process from 'child_process';

(async () => {

  const images: {
    version: string;
    // version hash + number.. hash = last commit that changed the dir?
    sprites: {[source in keyof Sources]: [string, number]}
    // + icons, categories, types, etc... just "misc"?
    diffs: {[version: string]: {[path: string]: number}
  };

  const last = await (await fetch('https://play.pkmn.cc/data/index.json')).json();
  const run = (cwd: string, cmd: string, args: string[]) =>
    child_process.execFileSync(cmd, args, {cwd, encoding: 'utf8'});

  const head = (dir: string) => run(dir, 'git', ['rev-parse', 'HEAD']).slice(0, abbrev);
  const HEAD = {smogon: head(smogon), randbats: head(randbats)};

  console.log(stringify({formats, data, random, images}, {maxLength: 200}));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
```
