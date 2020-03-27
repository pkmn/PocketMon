import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import * as style from './style.css';
var Profile = function (props) {
    var user = props.user;
    var _a = useState(Date.now()), time = _a[0], setTime = _a[1];
    var _b = useState(0), count = _b[0], setCount = _b[1];
    // gets called when this route is navigated to
    useEffect(function () {
        var timer = window.setInterval(function () { return setTime(Date.now()); }, 1000);
        // gets called just before navigating away from the route
        return function () {
            clearInterval(timer);
        };
    }, []);
    // update the current time
    var increment = function () {
        setCount(count + 1);
    };
    return (h("div", { class: style.profile },
        h("h1", null,
            "Profile: ",
            user),
        h("p", null,
            "This is the user profile for a user named ",
            user,
            "."),
        h("div", null,
            "Current time: ",
            new Date(time).toLocaleString()),
        h("p", null,
            h("button", { onClick: increment }, "Click Me"),
            " Clicked ",
            count,
            ' ',
            "times.")));
};
export default Profile;
//# sourceMappingURL=index.js.map