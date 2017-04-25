import '../less/index.less';

import Router from 'preact-router';
import { createHashHistory } from 'history';
import { h, render } from 'preact';

import Home from './pages/Home';
import Editor from './pages/Editor';
import NotFound from './pages/NotFound';

const Main = () => (
    <Router history={createHashHistory()}>
        <Home path="/" />
        <Editor path="/edit" id="" version="0" />
        <Editor path="/edit/:id" version="0" />
        <Editor path="/edit/:id/:version" />
        <NotFound default />
    </Router>
);

render(<Main />, document.getElementById('jsx-wrapper'));
