/**
 * Main application bootstrap, creates the necessary objects and provides
 * a `.start()` method to kick off the server.
 */
import * as restify from 'restify';
import * as config from './config';
import logger from './lib/logger';
import middleware from './middleware';
import routes from './routes';

export default {
    start() {
        const app = restify.createServer({ log: logger, name: 'playground-server' });

        // Initialize
        middleware(app);
        routes(app);

        // Start listening for connections
        app.listen(
            config.port,
            config.host,
            () => {
                logger.info('%s listening to: %s', app.name, app.url);
            }
        );
    }
}
