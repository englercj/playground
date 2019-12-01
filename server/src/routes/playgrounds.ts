// TODO: Optimistic locking failure retries!

import * as CODES from 'http-codes';
import * as restify from 'restify';
import * as bunyan from 'bunyan';
import { Tag } from '../models/Tag';
import { Playground } from '../models/Playground';
import { ExternalJs } from '../models/ExternalJs';
import { db } from '../lib/db';
import { HttpError } from '../lib/HttpError';
import { ITag, IExternalJs } from '../../../shared/types';
import { purgeCacheForUrls } from '../lib/cloudflare';

export function setupRoutes(app: restify.Server)
{
    /**
     * GET /playgrounds
     *
     * Searches for playgrounds that match the given query.
     *
     * 200: The stored playground data.
     * 404: No data found for the given query.
     * 422: Invalid query given for searching.
     * 500: Server error, some error happened when trying to load the playgrounds.
     */
    app.get('/api/playgrounds', (req, res, next) =>
    {
        const { q } = req.params;

        const logState: any = { params: { q } };

        if (!q)
        {
            const msg = `Failed to search playgrounds, query param is empty.`;

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
                    const msg = `No playgrounds found during search.`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else
                {
                    req.log.info(`Loaded ${values.length} playgrounds by searching.`);
                    res.json(CODES.OK, values);
                }

                next();
            })
            .catch((err) =>
            {
                logState.err = err;
                req.log.error(logState, 'Failed to search playgrounds.');
                res.json(CODES.INTERNAL_SERVER_ERROR, {
                    msg: `There was an error trying to load playgrounds during search.`,
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

        Playground.findOne({ where: { slug }, include: [Tag, ExternalJs] })
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
        const { name, description, contents, author, pixiVersion, isPublic, autoUpdate } = req.body;
        const params = { name, isPublic, pixiVersion, isContentsEmpty: !contents };

        const logState: any = { params };

        const tagsData: ITag[] = req.body.tags || [];
        const externaljsData: IExternalJs[] = req.body.externaljs || [];

        if (!contents || contents.length > 16777214
            || !pixiVersion || pixiVersion.length > 1023)
        {
            req.log.error(logState, 'Failed to save playground, invalid params');
            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, 'contents' or 'pixiVersion' is invalid.` });
            next();
            return;
        }

        db.transaction((t) =>
        {
            return Playground.create(
                { name, description, contents, author, pixiVersion, isPublic, autoUpdate },
                { transaction: t })
                .then((value) =>
                {
                    return prepareExternaljs(value, t, externaljsData)
                        .then(() => Promise.resolve(value));
                })
                .then((value) =>
                {
                    req.log.info(`Created a new playground: ${value.slug}`);

                    if (tagsData.length)
                    {
                        const tags = prepareTags(req.log, tagsData);
                        return value.$set('tags', tags, { transaction: t })
                            .then(() => Promise.resolve(value));
                    }

                    return Promise.resolve(value);
                })
                .then((value) =>
                {
                    return Playground.findByPk(
                        value.id,
                        {
                            include: [Tag, ExternalJs],
                            transaction: t
                        });
                })
                .then((value) =>
                {
                    res.json(CODES.CREATED, value);
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
        const { id, name, description, contents, author, pixiVersion, isPublic, autoUpdate } = req.body;
        const params = { id, slug, name, isPublic, pixiVersion, isContentsEmpty: !contents };

        const logState: any = { params };

        const tagsData: ITag[] = req.body.tags || [];
        const externaljsData: IExternalJs[] = req.body.externaljs || [];

        if (!slug || slug.length !== 21
            || !contents || contents.length > 16777214
            || !pixiVersion || pixiVersion.length > 1023)
        {
            req.log.error(logState, 'Failed save playground, invalid params');
            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, either 'slug', 'contents', or 'pixiVersion' is invalid.` });
            next();
            return;
        }

        db.transaction((t) =>
        {
            return Playground.findByPk(id, { transaction: t })
                .then((value) =>
                {
                    if (!value)
                    {
                        return Promise.reject(
                            new HttpError(
                                CODES.NOT_FOUND,
                                `No playground found with id: ${id}.`));
                    }

                    return value.update(
                        { name, description, contents, author, pixiVersion, isPublic, autoUpdate, versionsCount: value.versionsCount + 1 },
                        { transaction: t });
                })
                .then((value) =>
                {
                    return ExternalJs.destroy({
                        where: { playgroundId: value.id },
                        transaction: t,
                    })
                    .then(() => Promise.resolve(value));
                })
                .then((value) =>
                {
                    return prepareExternaljs(value, t, externaljsData)
                        .then(() => Promise.resolve(value));
                })
                .then((value) =>
                {
                    if (value.slug !== slug)
                    {
                        return Promise.reject(
                            new HttpError(
                                CODES.INTERNAL_SERVER_ERROR,
                                `Playground found with id: ${id}, but has mismatched slug. Expected '${slug}', but got '${value.slug}'.`));
                    }
                    else
                    {
                        req.log.info(`Updated playground with slug: ${slug}, added version: ${value.versionsCount}`);

                        if (tagsData.length)
                        {
                            const tags = prepareTags(req.log, tagsData);
                            return value.$set('tags', tags, { transaction: t })
                                .then(() => Promise.resolve(value));
                        }

                        return Promise.resolve(value);
                    }
                })
                .then((value) =>
                {
                    return Playground.findByPk(
                        value.id,
                        {
                            include: [Tag, ExternalJs],
                            transaction: t
                        });
                })
                .then((value) =>
                {
                    purgeCacheForUrls(req.log, [
                        `https://pixiplayground.com/api/playground/${slug}`,
                        `https://www.pixiplayground.com/api/playground/${slug}`,
                    ]);
                    res.json(CODES.OK, value);
                    next();
                })
                .catch((err) =>
                {
                    logState.err = err;
                    req.log.error(logState, 'Failed to save playground.');
                    res.json(
                        err.httpCode ? err.httpCode : CODES.INTERNAL_SERVER_ERROR,
                        { msg: 'There was an error trying to save the playground.' });

                    next();
                });
        });
    });
};

function prepareTags(log: bunyan, tagsData: ITag[]): Tag[]
{
    const tags: Tag[] = [];

    for (let i = 0; i < tagsData.length; ++i)
    {
        if (tagsData[i] && typeof tagsData[i].id === 'number')
        {
            tags.push(new Tag({ id: tagsData[i].id }));
        }
        else
        {
            log.info(`Invalid tag listed in create, skipping. Tag: ${JSON.stringify(tagsData[i])}`);
        }
    }

    return tags;
}

function prepareExternaljs(value: Playground, t: any, externaljsData: IExternalJs[])
{
    const externaljsTasks = [];

    for (let i = 0; i < externaljsData.length; ++i)
    {
        if (!externaljsData[i])
            continue;

        let url = externaljsData[i].url;

        if (!url || typeof url !== 'string')
            continue;

        url = url.trim();

        if (!url || url.length > 1023)
            continue;

        externaljsTasks.push(value.$create(
            'externalj', // Sequelize removes the 's' of 'externaljs'
            { url },
            { transaction: t }));
    }

    return Promise.all(externaljsTasks);
}
