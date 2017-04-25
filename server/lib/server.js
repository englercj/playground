'use strict';

/**
 * Main application bootstrap, creates the necessary objects and provides
 * a `.start()` method to kick off the server.
 */
const restify = require('restify');
const config = require('./config');
const logger  = require('./logger');
const app = restify.createServer({ log: logger, name: 'playground-server' });

// Initialize
require('./middleware')(app);
require('./routes')(app);

// Start listening for connections
app.listen(
    config.port,
    config.host,
    () => {
        logger.info('%s listening to: %s', app.name, app.url);
    }
);
