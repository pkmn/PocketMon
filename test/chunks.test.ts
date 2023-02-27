import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

import {describe, expect, test} from 'vitest';
import {init, parse} from 'es-module-lexer';

const dist = path.resolve(fileURLToPath(import.meta.url), '../../dist');

const chunk = (file: string) => file.slice(0, file.lastIndexOf('-', file.length - 4));

const CHUNKS: {[chunk: string]: string[]} = {
  'index': [],
  // 'index': [
  //   'pkmn.sim', 'pkmn.sim.current.gen', 'pkmn.sim.formats', 'pkmn.sim.learnsets',
  //   'pkmn.sim.legality', 'pkmn.sim.classic.gens', 'pkmn.sim.modern.gens', 'pkmn.sim.text',
  // ],
  // 'pkmn.sets': [],
  // 'pkmn.streams': [],
  // 'pkmn.sim': [
  //   'pkmn.sim.current.gen', 'pkmn.sim.formats', 'pkmn.sim.learnsets', 'pkmn.sim.legality',
  //   'pkmn.sim.classic.gens', 'pkmn.sim.modern.gens', 'pkmn.sim.text',
  // ],
  // 'pkmn.sim.formats': [],
  // 'pkmn.sim.learnsets': [],
  // 'pkmn.sim.legality': [],
  // 'pkmn.sim.text': [],
  // 'pkmn.sim.current.gen': [],
  // 'pkmn.sim.classic.gens': [],
  // 'pkmn.sim.modern.gens': [],
};

describe('chunks', async () => {
  await init;
  for (const file of fs.readdirSync(dist)) {
    if (!file.endsWith('.js')) continue;
    const name = chunk(file);

    test(name, () => {
      const expected = CHUNKS[name];
      expect(expected).toBeDefined();

      const source = fs.readFileSync(path.join(dist, file), 'utf8');
      const imports = parse(source)[0].map(i => chunk(i.n!.slice(2)));
      expect(new Set(imports)).toEqual(new Set(expected));
    });
  }
});
