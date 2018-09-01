import { h, render } from 'preact';
import { createHashHistory } from 'history';
import Router from 'preact-router';

import { Home } from './Home';
import { Editor } from './Editor';
import { Search } from './Search';
import { NotFound } from './NotFound';

export default (
    <Router history={createHashHistory()}>
        <Home path="/" />
        <Editor path="/edit" slug="" />
        <Editor path="/edit/:slug" />
        <Search path="/search" />
        <NotFound default />
    </Router>
)
