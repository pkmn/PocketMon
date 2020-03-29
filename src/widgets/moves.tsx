
import { h, Component } from 'preact';


export interface Move {
  name: string;
  type: string;
  pp: number;
  maxpp: number;
}

export class Moves extends Component {
  render(moves: MoveData[]) {
    const root = document.createElement('div');
    root.classList.add('moves');

    for (const move of moves) {
      root.appendChild(new Move().render(move));
    }

    return root;
  }
}

export class Move extends Component {
  render(move: MoveData) {

    return (
      <button class="move type-{move.type}">
        <div class="info">
          <div class="spacer"></div>
          <div class="name">{move.name}</div>
          <div class="details">
            <small class="type">{move.type}</small>
            <small class="pp">{move.pp}/{move.maxpp}</small>
          </div>
        </div>
      </button>
  );



    const button = document.createElement('button');
    button.classList.add('move', `type-${move.type}`);

    const spacer = document.createElement('div');
    spacer.classList.add('spacer');

    const name = document.createElement('div');
    name.classList.add('name');
    name.textContent = move.name;

    const details = document.createElement('div');
    details.classList.add('details');
    const type = document.createElement('small');
    type.classList.add('type');
    type.textContent = move.type;
    const pp = document.createElement('small');
    pp.classList.add('pp');
    pp.textContent = `${move.pp}/${move.maxpp}`;
    details.appendChild(type);
    details.appendChild(pp);

    button.appendChild(spacer);
    button.appendChild(name);
    button.appendChild(details);

    return button;
  }
}