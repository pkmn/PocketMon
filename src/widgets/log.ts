import { h, Component } from 'preact';

interface Props {
  html: string;
}

export default class Log extends Component<Props> {
  render(props: Props) {
    const div = document.createElement('div');
    div.classList.add('log');
    div.innerHTML =  html;
    return div;
  }
}