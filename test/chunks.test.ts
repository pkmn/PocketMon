import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import {describe, expect, test} from 'vitest';
import {init, parse} from 'es-module-lexer';

const dist = path.resolve(fileURLToPath(import.meta.url), '../../dist');

const CHUNKS: {[chunk: string]: string[]} = {
  'index': [],
  // 'index': [
  //   'pkmn.sim', 'pkmn.sim.current.gen', 'pkmn.sim.formats', 'pkmn.sim.learnsets',
  //   'pkmn.sim.classic.gens', 'pkmn.sim.modern.gens', 'pkmn.sim.text',
  // ],
  // 'pkmn.sets': [],
  // 'pkmn.streams': [],
  // 'pkmn.sim': [
  //   'pkmn.sim.current.gen', 'pkmn.sim.formats', 'pkmn.sim.learnsets',
  //   'pkmn.sim.classic.gens', 'pkmn.sim.modern.gens', 'pkmn.sim.text',
  // ],
  // 'pkmn.sim.formats': [],
  // 'pkmn.sim.learnsets': [],
  // 'pkmn.sim.text': [],
  // 'pkmn.sim.current.gen': [],
  // 'pkmn.sim.classic.gens': [],
  // 'pkmn.sim.modern.gens': [],
};

describe('chunks', async () => {
  await init;
  for (const file of fs.readdirSync(dist)) {
    if (!file.endsWith('.js')) continue;
    const chunk = file.slice(0, file.lastIndexOf('.', file.length - 4));

    test(chunk, () => {
      const expected = CHUNKS[chunk];
      expect(expected).toBeDefined();
      const source = fs.readFileSync(path.join(dist, file), 'utf8');
      const imports =
        new Set(parse(source)[0].map(i => i.n!.slice(2, i.n!.lastIndexOf('.', i.n!.length - 4))));
      expect(imports).toEqual(new Set(expected));
    });
  }
});
