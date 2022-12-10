import 'source-map-support/register';

import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

import stringify from 'json-stringify-pretty-compact';

type Metadata = [string, number, number];

if (process.argv.length < 4) {
  throw new Error('Usage: build <smogon> <randbats>');
}

const smogon = path.resolve(process.cwd(), process.argv[2]);
if (!fs.lstatSync(path.join(smogon, '.git')).isDirectory()) {
  throw new Error(`Invalid path to pkmn/smogon git repository: ${smogon}`);
}

const randbats = path.resolve(process.cwd(), process.argv[3]);
if (!fs.lstatSync(path.join(randbats, '.git')).isDirectory()) {
  throw new Error(`Invalid path to pkmn/randbats git repository: ${randbats}`);
}

const hash = (dir: string, file: string) =>
  crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, file)))
    .digest('hex').slice(0, 8);

const read = (dir: string, json: string) =>
  JSON.parse(fs.readFileSync(path.join(dir, json), 'utf8'));

const formats = hash(smogon, 'data/formats/index.json');

const data: {[formatid: string]: [Metadata?, Metadata?, Metadata?]} = {};
for (const [i, type] of (['stats', 'sets', 'analyses'] as const).entries()) {
  for (const [file, sizes] of Object.entries(read(smogon, `data/${type}/index.json`))) {
    const format = file.slice(0, -5);
    if (format.length < 5) continue;
    data[format] = data[format] || [null, null, null];
    data[format][i] = [hash(smogon, `data/${type}/${file}`), ...(sizes as [number, number])];
  }
}

const random: {[formatid: string]: Metadata} = {};
for (const [file, sizes] of Object.entries(read(randbats, 'data/stats/index.json'))) {
  const format = file.slice(0, -5);
  random[format] = [hash(randbats, `data/stats/${file}`), ...(sizes as [number, number])];
}

console.log(stringify({formats, data, random}, {maxLength: 200}));
