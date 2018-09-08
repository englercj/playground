// TODO: Optimistic locking failure retries!

import * as https from 'https';
import * as CODES from 'http-codes';
import * as restify from 'restify';
import { Playground } from './models/Playground';
import { db } from './lib/db';
import { isProductionEnv, cloudflare } from './config';

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

    /**
     * GET /playgrounds
     *
     * Searches for playgrounds that match the given query.
     *
     * 200: The stored playground data.
     * 404: No data found for the given query.
     * 422: No query given for searching.
     * 500: Server error, some error happened when trying to load the playgrounds.
     */
    app.get('/api/playgrounds', (req, res, next) =>
    {
        const { q } = req.params;

        const logState: any = { params: { q } };

        if (!q)
        {
            const msg = `Failed to search playgrounds, query is invalid. q: ${q}.`;

            req.log.error(logState, msg);
            res.json(CODES.UNPROCESSABLE_ENTITY, { msg });

            next();
            return;
        }

        Playground.search(q)
            .then((values) =>
            {
                if (!values || !values.length)
                {
                    const msg = `No playgrounds found with query: ${q}.`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else
                {
                    req.log.info(`Loaded ${values.length} playgrounds using query: ${q}`);
                    res.json(CODES.OK, values);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to search playgrounds.');
                res.json(CODES.INTERNAL_SERVER_ERROR, {
                    msg: `There was an error trying to load playgrounds using query: ${q}`,
                });

                next();
            });
    });

    /**
     * GET /playground/:slug
     *
     * Gets the data for a stored playground.
     *
     * 200: The stored playground data.
     * 404: No data found for the given slug.
     * 500: Server error, some error happened when trying to load the playground.
     */
    app.get('/api/playground/:slug', (req, res, next) =>
    {
        const { slug } = req.params;
        const logState: any = { params: { slug } };

        Playground.findOne({ where: { slug } })
            .then((value) =>
            {
                if (!value)
                {
                    const msg = `No playground found with slug: ${slug}`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else
                {
                    req.log.info(`Loaded playground using slug: ${slug}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to get playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: `There was an error trying to load playground ${slug}.` });

                next();
            });
    });

    /**
     * POST /playground
     *
     * Creates a new playground.
     *
     * 201: New playground created, link can be found in Link header.
     * 422: New playground is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the playground.
     */
    app.post('/api/playground', (req, res, next) =>
    {
        const { name, description, contents, author, pixiVersion, isPublic } = req.body;
        const params = { name, isPublic, pixiVersion, isContentsEmpty: !contents };

        const logState: any = { params };

        const externalJs: string[] = req.body.externalJs || [];

        if (!contents)
        {
            req.log.error(logState, 'Failed to save playground, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params contents is empty.` });

            next();
            return;
        }

        db.transaction((t) =>
        {
            return Playground.create(
                { name, description, contents, author, pixiVersion, isPublic, externalJs },
                { transaction: t })
                .then((value) =>
                {
                    req.log.info(`Created a new playground: ${value.slug}`);
                    res.json(CODES.OK, value);

                    next();
                })
                .catch((err) =>
                {
                    logState.err = err;
                    req.log.error(logState, 'Failed to create playground.');
                    res.json(CODES.INTERNAL_SERVER_ERROR, { msg: 'There was an error trying to save the playground.' });

                    next();
                });
        });
    });

    /**
     * PUT /playground/:slug
     *
     * Updates a playground with a new version.
     *
     * 201: New playground version created, link can be found in Link header.
     * 422: New playground version is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the playground version.
     */
    app.put('/api/playground/:slug', (req, res, next) =>
    {
        const { slug } = req.params;
        const { id, name, description, contents, author, pixiVersion, isPublic } = req.body;
        const params = { id, slug, name, isPublic, pixiVersion, isContentsEmpty: !contents };

        const logState: any = { params };

        const externalJs: string[] = req.body.externalJs || [];

        if (!slug || !contents)
        {
            req.log.error(logState, 'Failed save playground, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, either slug or contents is empty.` });

            next();
            return;
        }

        db.transaction((t) =>
        {
            return Playground.findById(id, { transaction: t })
                .then((value) =>
                {
                    return value.update(
                        { name, description, contents, author, pixiVersion, isPublic, externalJs, versionsCount: value.versionsCount + 1 },
                        { transaction: t })
                        .then((value) =>
                        {
                            if (!value)
                            {
                                const msg = `No playground found with id: ${id}.`;

                                req.log.info(logState, msg);
                                res.json(CODES.NOT_FOUND, { msg });
                            }
                            else if (value.slug !== slug)
                            {
                                const msg = `Playground found with id: ${id}, but has mismatched slug. Expected '${slug}', but got '${value.slug}'.`;

                                req.log.error(logState, msg);
                                res.json(CODES.INTERNAL_SERVER_ERROR, { msg });
                            }
                            else
                            {
                                req.log.info(`Created new playground version using slug: ${slug}, added version: ${value.versionsCount}`);
                                purgeCache(req, slug);
                                res.json(CODES.OK, value);
                            }

                            next();
                        })
                        .catch((err) =>
                        {
                            logState.err = err;
                            req.log.error(logState, 'Failed to save playground.');
                            res.json(CODES.INTERNAL_SERVER_ERROR, { msg: 'There was an error trying to save the playground.' });

                            next();
                        });
                });
        });
    });
};

function purgeCache(req: restify.Request, slug: string)
{
    if (!isProductionEnv)
        return;

    const postData = JSON.stringify({
        files: [
            `https://pixiplayground.com/api/playground/${slug}`,
            `https://www.pixiplayground.com/api/playground/${slug}`,
            `http://pixiplayground.com/api/playground/${slug}`,
            `http://www.pixiplayground.com/api/playground/${slug}`,
        ],
    });

    const cfReq = https.request(
        `https://api.cloudflare.com/client/v4/zones/${cloudflare.zoneId}/purge_cache`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length,
                'X-Auth-Email': cloudflare.authName,
                'X-Auth-Key': cloudflare.authKey,
            },
        },
        (res) =>
        {
            let resStr = '';

            res.on('data', (chunk) => resStr += chunk);
            res.on('end', () =>
            {
                if (res.statusCode !== CODES.OK)
                    return req.log.error({ code: res.statusCode, headers: res.headers }, `Failed to purge Cloudflare cache for slug: ${slug}`);

                try
                {
                    let resBody = JSON.parse(resStr);

                    if (resBody.success)
                        req.log.info(resBody, `Successfully purged Cloudflare cache for slug: ${slug}`);
                    else
                        req.log.error(resBody, `Failed to purge Cloudflare cache for slug: ${slug}`);
                }
                catch (e)
                {
                    req.log.error({ err: e }, `Failed to parse response from Cloudflare API during cache purge for slug: ${slug}`);
                }
            });
        });

    cfReq.on('error', (err) =>
    {
        req.log.error({ err }, `Failed to purge cache for slug: ${slug}.`);
    });

    cfReq.write(postData);
    cfReq.end();
}
