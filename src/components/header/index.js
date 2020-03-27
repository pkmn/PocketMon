import { h } from 'preact';
import { Link } from 'preact-router/match';
import * as style from './style.css';
var Header = function () {
    return (h("header", { class: style.header },
        h("h1", null, "Preact App"),
        h("nav", null,
            h(Link, { activeClassName: style.active, href: '/' }, "Home"),
            h(Link, { activeClassName: style.active, href: '/profile' }, "Me"),
            h(Link, { activeClassName: style.active, href: '/profile/john' }, "John"))));
};
export default Header;
//# sourceMappingURL=index.js.map