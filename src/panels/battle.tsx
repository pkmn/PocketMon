import { h, Component } from 'preact';

import {Log} from '../widgets/log';
import {MoveData, Moves} from '../widgets/moves';

export interface BattleData {
  log: string;
  moves: MoveData[];
}

export class BattleComponent {
  render(battle: BattleData) {
    const root = document.createElement('div');
    root.classList.add('battle');

    root.appendChild(new Log().render(battle.log));
    root.appendChild(new Moves().render(battle.moves));

    return root;
  }
}