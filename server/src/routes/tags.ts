// TODO: Optimistic locking failure retries!

import * as CODES from 'http-codes';
import * as restify from 'restify';
import { Op } from 'sequelize';
import { Tag } from '../models/Tag';
import { db } from '../lib/db';
import { purgeCacheForUrls } from '../lib/cloudflare';

export function setupRoutes(app: restify.Server)
{
    /**
     * GET /tags
     *
     * Searches for tags that match the given query.
     *
     * 200: The stored tag data.
     * 404: No data found for the given query.
     * 422: No query given for searching.
     * 500: Server error, some error happened when trying to load the tags.
     */
    app.get('/api/tags', (req, res, next) =>
    {
        const { q } = req.params;

        const logState: any = { params: { q } };

        if (!q)
        {
            const msg = `Failed to search tags, query param is empty.`;

            req.log.error(logState, msg);
            res.json(CODES.UNPROCESSABLE_ENTITY, { msg });

            next();
            return;
        }

        const search = `%${q}%`;

        Tag.findAll({ where: { name: { [Op.like]: search } } })
            .then((values) =>
            {
                if (!values || !values.length)
                {
                    const msg = `No tags found during search.`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else
                {
                    req.log.info(`Loaded ${values.length} tags by searching.`);
                    res.json(CODES.OK, values);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to search tags.');
                res.json(CODES.INTERNAL_SERVER_ERROR, {
                    msg: `There was an error trying to load tags during search.`,
                });

                next();
            });
    });

    /**
     * GET /tag/:id
     *
     * Gets the data for a stored tag.
     *
     * 200: The stored tag data.
     * 404: No data found for the given slug.
     * 500: Server error, some error happened when trying to load the tag.
     */
    app.get('/api/tag/:id', (req, res, next) =>
    {
        const { id } = req.params;
        const logState: any = { params: { id } };

        Tag.findById(id)
            .then((value) =>
            {
                if (!value)
                {
                    const msg = `No tag found with id: ${id}`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else
                {
                    req.log.info(`Loaded tag using id: ${id}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to get tag.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: `There was an error trying to load tag ${id}.` });

                next();
            });
    });

    /**
     * POST /tag
     *
     * Creates a new tag.
     *
     * 201: New tag created, link can be found in Link header.
     * 422: New tag is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the tag.
     */
    app.post('/api/tag', (req, res, next) =>
    {
        const { name } = req.body;

        const logState: any = { params: { name } };

        if (!name || name.length > 255)
        {
            req.log.error(logState, 'Failed to save tag, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, 'name' is invalid.` });

            next();
            return;
        }

        db.transaction((t) =>
        {
            return Tag.create({ name }, { transaction: t })
                .then((value) =>
                {
                    req.log.info(`Created a new tag: ${value.id}`);
                    res.json(CODES.CREATED, value);

                    next();
                })
                .catch((err) =>
                {
                    logState.err = err;
                    req.log.error(logState, 'Failed to create tag.');
                    res.json(CODES.INTERNAL_SERVER_ERROR, { msg: 'There was an error trying to save the tag.' });

                    next();
                });
        });
    });

    /**
     * PUT /tag/:id
     *
     * Updates a tag with new data.
     *
     * 201: Tag updated, link can be found in Link header.
     * 422: New tag data is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the tag.
     */
    app.put('/api/tag/:id', (req, res, next) =>
    {
        const { id } = req.params;
        const { name } = req.body;

        const logState: any = { params: { id, name } };

        if (!name || name.length > 255)
        {
            req.log.error(logState, 'Failed save tag, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, 'name' is invalid.` });

            next();
            return;
        }

        db.transaction((t)=>
        {
            return Tag.findById(id, { transaction: t })
                .then((value) =>
                {
                    return value.update({ name }, { transaction: t })
                        .then((value) =>
                        {
                            if (!value)
                            {
                                const msg = `No tag found with id: ${id}.`;

                                req.log.info(logState, msg);
                                res.json(CODES.NOT_FOUND, { msg });
                            }
                            else
                            {
                                req.log.info(`Updated tag with id ${id} to use name: ${name}.`);
                                purgeCacheForUrls(req.log, [
                                    `https://pixiplayground.com/api/tag/${id}`,
                                    `https://www.pixiplayground.com/api/tag/${id}`,
                                    `http://pixiplayground.com/api/tag/${id}`,
                                    `http://www.pixiplayground.com/api/tag/${id}`,
                                ]);
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
}
