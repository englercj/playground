process.env.NODE_ENV = 'test';

import server from '../../src/server';
import db from '../../src/lib/db';
import * as restify from 'restify';
import * as supertest from 'supertest';

let app: restify.Server = null;
export let request: supertest.SuperTest<supertest.Test> = null;

// run the server before all tests
before((done) => {
    db.sync({ force: true })
        .then(() => server.start())
        .then((_app) => {
            app = _app;
            request = supertest(app.url);

            done();
        });
});

// close server when tests complete
after((done) => {
    app.close(done);
});

export function clearDb() {
    return db.sync({ force: true })
}
