import { h } from 'preact';
import { Link } from 'preact-router/match';
import * as style from './style.css';
var Notfound = function () {
    return (h("div", { class: style.notfound },
        h("h1", null, "Error 404"),
        h("p", null, "That page doesn't exist."),
        h(Link, { href: '/' },
            h("h4", null, "Back to Home"))));
};
export default Notfound;
//# sourceMappingURL=index.js.map