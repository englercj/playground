/**
 * Main application bootstrap, creates the necessary objects and provides
 * a `.start()` method to kick off the server.
 */
import { logger } from './lib/logger';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import * as restify from 'restify';
import * as config from './config';
import * as Promise from 'bluebird';

export function start()
{
    const app = restify.createServer({ log: logger, name: 'playground-server' });

    // Initialize
    setupMiddleware(app);
    setupRoutes(app);

    // Start listening for connections
    return new Promise<restify.Server>((resolve, reject) =>
    {
        app.listen(config.port, config.host, () =>
        {
            logger.info('%s listening to: %s', app.name, app.url);
            resolve(app);
        });
    });
}
