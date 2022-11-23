import {Store} from './store';

// Orientation
setTimeout(() => window.scrollTo(0, 1), 0);
if (typeof window.orientation !== 'undefined') {
  // Re-render on orientation change: https://stackoverflow.com/questions/7919172
  window.addEventListener('orientationchange', () => {
    document.body.style.display = 'none';
    // eslint-disable-next-line no-unused-expressions
    document.body.offsetHeight; // cause a reflow
    document.body.style.display = 'block'; // cause a repaint
  });
}

// Theme
export type Theme = 'System' | 'Light' | 'Dark';
const settings: {theme: Theme} = {theme: 'System'};
const setTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme.toLowerCase());
};
const pref = window.matchMedia('(prefers-color-scheme: dark)');
pref.addEventListener('change', e => {
  if (settings.theme === 'System') setTheme(e.matches ? 'Dark' : 'Light');
});
setTheme(settings.theme === 'System' ? pref.matches ? 'Dark' : 'Light' : settings.theme);

(async () => {
  // Store
  const store = new Store();
  await store.set('message', `I like shorts! They're comfy and easy to wear!`);
  const message: string = await store.get('message');

  // JSX
  const Icon = ({num}: {num: number}) => {
    const size = 32;
    const url = 'https://pkmn.cc/sprites/gsicons-sheet.png';
    const top = -Math.floor(num / 17) * size;
    const left = -(num % 17) * size;
    const style = {
      display: 'inline-block',
      width: size,
      height: size,
      background: `transparent url(${url}) no-repeat scroll ${left}px ${top}px`,
      margin: `${(30 - size) / 2}px ${(40 - size) / 2}px`,
    };
    return <span className={"pixelated"} style={style}></span>;
  };

  const Message = ({value}: {value: string}) =>
    <div className="message"><p>{value}</p></div>;

  const App = ({message}: {message: string}) =>
    (<div id="app" style={{
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <Message value={message} />
      <Icon num={25 - 1} />
    </div>);

  const root = document.getElementById('root')!;
  root.appendChild(<App message={message} /> as HTMLElement);
})().catch(console.error);
