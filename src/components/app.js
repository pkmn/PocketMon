import { h } from 'preact';
import { Route, Router } from 'preact-router';
import Home from '../routes/home';
import Profile from '../routes/profile';
import NotFoundPage from '../routes/notfound';
import Header from './header';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (module.hot) {
    // tslint:disable-next-line:no-var-requires
    require('preact/debug');
}
var App = function () {
    var currentUrl;
    var handleRoute = function (e) {
        currentUrl = e.url;
    };
    return (h("div", { id: 'app' },
        h(Header, null),
        h(Router, { onChange: handleRoute },
            h(Route, { path: '/', component: Home }),
            h(Route, { path: '/profile/', component: Profile, user: 'me' }),
            h(Route, { path: '/profile/:user', component: Profile }),
            h(NotFoundPage, { default: true }))));
};
export default App;
//# sourceMappingURL=app.js.map