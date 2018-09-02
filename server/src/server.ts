/**
 * Main application bootstrap, creates the necessary objects and provides
 * a `.start()` method to kick off the server.
 */
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { setupModels } from './models';
import { logger } from './lib/logger';
import { db } from './lib/db';
import * as restify from 'restify';
import * as config from './config';

let app: restify.Server = null;

export function start(): Promise<restify.Server>
{
    app = restify.createServer({ log: logger, name: 'playground-server' });

    // Initialize
    setupMiddleware(app);
    setupRoutes(app);
    setupModels(db);

    // Start listening for connections
    return db.authenticate()
        .then(() => new Promise<restify.Server>((resolve) =>
        {
            logger.info('Connected to DB.');

            app.listen(config.port, config.host, () =>
            {
                logger.info('%s listening to: %s', app.name, app.url);
                resolve(app);
            });
        })) as any;
}

export function close(): Promise<void>
{
    if (!app)
        return Promise.resolve();

    return new Promise<void>(app.close)
        .then(db.close);
}
