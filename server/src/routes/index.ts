// TODO: Optimistic locking failure retries!

import * as CODES from 'http-codes';
import * as restify from 'restify';

import { setupRoutes as playgroundRoutes } from './playgrounds';
import { setupRoutes as tagRoutes } from './tags';

export function setupRoutes(app: restify.Server)
{
    /**
     * GET /health
     *
     * Returns 200 for AWS health checks.
     */
    app.get('/api/health', (req, res, next) =>
    {
        res.send(CODES.OK);
        next();
    });

    // Child routes
    playgroundRoutes(app);
    tagRoutes(app);
};
