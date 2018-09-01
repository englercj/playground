import { h, render } from 'preact';
import { createHashHistory } from 'history';
import { Router } from 'preact-router';

import { Editor } from './Editor';
// import { Home } from './Home';
import { NotFound } from './NotFound';
import { Redirect } from './Redirect';
import { Search } from './Search';

export default (
    <Router history={createHashHistory()}>
        {/* <Home path="/" /> */}
        <Redirect path="/" to="/edit" />
        <Editor path="/edit" slug="" />
        <Editor path="/edit/:slug" />
        <Search path="/search" />
        <NotFound default />
    </Router>
)
