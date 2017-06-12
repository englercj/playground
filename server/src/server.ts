/**
 * Main application bootstrap, creates the necessary objects and provides
 * a `.start()` method to kick off the server.
 */
import logger from './lib/logger';
import middleware from './middleware';
import routes from './routes';
import * as restify from 'restify';
import * as config from './config';
import * as Promise from 'bluebird';

export default {
    start() {
        const app = restify.createServer({ log: logger, name: 'playground-server' });

        // Initialize
        middleware(app);
        routes(app);

        // Start listening for connections
        return new Promise<restify.Server>((resolve, reject) => {
            app.listen(
                config.port,
                config.host,
                () => {
                    logger.info('%s listening to: %s', app.name, app.url);

                    resolve(app);
                }
            );
        });
    }
}
