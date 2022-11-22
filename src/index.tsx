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

// Store
const store = new Store();
await store.set('message', 'hello');
const message: string = await store.get('message');

// JSX
const root = document.getElementById('root')!;
// const App = (props: {message: string}) =>
//   <div className="message"><p>{props.message}</p></div>;

// root.appendChild(<App message={message} />);

const div = document.createElement('div');
div.className = 'message';
const p = document.createElement('p');
p.appendChild(document.createTextNode(message));
div.appendChild(p);
root.appendChild(div);
