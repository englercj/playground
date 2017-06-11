import '../less/index.less';

import { render } from 'preact';

import routes from './pages/routes';

render(routes, document.getElementById('jsx-wrapper'));
