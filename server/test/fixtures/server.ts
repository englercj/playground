process.env.NODE_ENV = 'test';

import * as restify from 'restify';
import * as supertest from 'supertest';
import { start } from '../../src/server';
import { db } from '../../src/lib/db';

let app: restify.Server = null;
export let request: supertest.SuperTest<supertest.Test> = null;

// run the server before all tests
before((done) =>
{
    db.sync({ force: true })
        .then(() => start())
        .then((_app) =>
        {
            app = _app;
            request = supertest(app.url);

            done();
        });
});

// close server when tests complete
after((done) =>
{
    app.close(done);
});

export function clearDb()
{
    return db.sync({ force: true })
}
