const gen = 1;

const srcs = ['emerald', 'silver', 'emerald'];
const url = 'https://play.pokemonshowdown.com/sprites/';
const p1 = [
  ['Bulbasaur', 'gen1-back/bulbasaur.png'],
  ['Cynaquil', 'gen2-back/cyndaquil.png'],
  ['Salamence', 'gen3-back/salamence.png'],
];
const p2 = [
  ['Charmander', 'gen1rb/charmander.png'],
  ['Sentret', 'gen2s/sentret.png'],
  ['Scizor', 'gen3/scizor.png'],
];

const root = document.getElementById('root')!;
root.appendChild(
  <div className={`gen${gen}`}>
    <div className="scene">
      <img className="mock" src={`/mocks/${srcs[gen - 1]}.png`} />
      <span className="p1">{p1[gen - 1][0]}</span>
      <img className="p1 pixelated" src={`${url}${p1[gen - 1][1]}`} />
      <img className="p2 pixelated" src={`${url}${p2[gen - 1][1]}`} />
      <span className="p2">{p2[gen - 1][0]}</span>
    </div>
  </div>
);
