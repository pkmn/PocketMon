import { h } from 'preact';
import { shallow } from 'preact-render-spy';
import Header from '../components/header';
describe('Initial Test of the Header', function () {
    test('Header renders 3 nav items', function () {
        var context = shallow(h(Header, null));
        expect(context.find('h1').text()).toBe('Preact App');
        expect(context.find('Link').length).toBe(3);
    });
});
//# sourceMappingURL=header.test.js.map