// https://github.com/parcel-bundler/parcel/issues/1762
import 'regenerator-runtime/runtime';

import { h, render } from 'preact';

import {Battle} from './panels/battle';

render(<Battle />, document.getElementById('display')!);



  // log: `
  // pre withdrew Sudowoodo!<br />
  // pre sent out <b>Genesect</b>!<br />
  // <small>Pointed stones dug into the opposing Genesect!</small><br />
  // <small>The opposing Genesect is hurt by the spikes!</small><br />
  // <small>[The opposing Genesect's Download]</small><br />
  // <small>The opposing Genesect's Special Attack rose!</small><br />
  // <br />
  // Crustle used <b>X-Scissor!</b><br />
  // <small>It's not very effective...</small><br />
  // <small>(The opposing Genesect lost 20% of its health!)</small><br />
  // <br />
  // <small>Crustle restored a little HP using its Leftovers!</small><br />
  // <small>Crustle was hurt by poison!</small>`,
  // moves: [
  //   {
  //     name: 'Surf',
  //     type: 'Water',
  //     pp: 24,
  //     maxpp: 24,
  //   },
  //   {
  //     name: 'Ice Beam',
  //     type: 'Ice',
  //     pp: 16,
  //     maxpp: 16,
  //   },
  //   {
  //     name: 'Hidden Power',
  //     type: 'Electric',
  //     pp: 24,
  //     maxpp: 24,
  //   },
  //   {
  //     name: 'Psychic',
  //     type: 'Calm Mind',
  //     pp: 31,
  //     maxpp: 32,
  //   },
  // ],
