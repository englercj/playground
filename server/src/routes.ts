// TODO: Optimistic locking failure retries!

import * as CODES from 'http-codes';
import * as restify from 'restify';
import { Playground } from './models/Playground';
import { db } from './lib/db';

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
     * Searches for playgrounds that matche the given query.
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
                    req.log.debug(`Loaded ${values.length} playgrounds using query: ${q}`);
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
                    req.log.debug(`Loaded playground using slug: ${slug}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to get playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: `There was an error trying to load playground ${slug}@0` });

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
                { name, description, contents, author, pixiVersion, isPublic },
                { transaction: t })
                .then((value) =>
                {
                    req.log.debug(`Created a new playground: ${value.slug}`);
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
                        { name, description, contents, author, pixiVersion, isPublic, versionsCount: value.versionsCount + 1 },
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

                                req.log.info(logState, msg);
                                res.json(CODES.INTERNAL_SERVER_ERROR, { msg });
                            }
                            else
                            {
                                req.log.debug(`Created new playground version using slug: ${slug}, added version: ${value.versionsCount}`);
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
