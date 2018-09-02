import { logger } from './lib/logger';
import * as server from './server';

// Starts the server and notifies PM2 we are online
function startup()
{
    server.start().then(() =>
    {
        if (process.send)
            process.send('ready');

        logger.info('Application is up and ready.');
    });
}

// Shuts down the server and exits
let isShuttingDown = false;
function shutdown()
{
    if (isShuttingDown)
        return;

    isShuttingDown = true;
    logger.info('Application performing graceful shutdown.');

    // Stops the server from accepting new connections and finishes existing connections.
    server.close()
        .then(() => logger.info('Application graceful shutdown complete.'))
        .catch((err) =>
        {
            logger.error({ err }, 'Application graceful shutdown failed, stoppping process.');
            process.exit(1);
        });
}

// MAIN
process.on('SIGINT', () =>
{
    logger.info('SIGINT signal received.');
    shutdown();
});

process.on('message', (msg) =>
{
    if (msg == 'shutdown')
    {
        logger.info('Shutdown message received.');
        shutdown();
    }
});

startup();
