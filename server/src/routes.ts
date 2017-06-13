import * as CODES from 'http-codes';
import * as data from './lib/data';
import * as restify from 'restify';

export default function routesInit(app: restify.Server) {
    /**
     * GET /health
     *
     * Returns 200 for AWS health checks.
     */
    app.get('/api/health', (req, res, next) => {
        res.send(CODES.OK);
        next();
    });

    /**
     * GET /:slug
     *
     * Gets the data for a stored playground, using version 0.
     *
     * 200: The stored playground data.
     * 404: No data found for the given slug.
     * 500: Server error, some error happened when trying to load the playground.
     */
    app.get('/api/:slug', (req, res, next) => {
        const { slug } = req.params;
        const logState: any = { params: { slug } };

        data.getPlayground(slug, 0)
            .then((value) => {
                if (!value) {
                    const msg = `No playground found with slug: ${slug}`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else {
                    req.log.debug(`Loaded playground using slug: ${slug}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) => {
                logState.err = err;
                req.log.error(logState, 'Failed to get playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: `There was an error trying to load playground ${slug}@0` });

                next();
            });
    });

    /**
     * GET /:slug/:version
     *
     * Gets the data for a stored playground, using the version specified.
     *
     * 200: The stored playground data.
     * 404: No data found for the given slug/version.
     * 422: Invalid version specified.
     * 500: Server error, some error happened when trying to load the playground.
     */
    app.get('/api/:slug/:version', (req, res, next) => {
        const { slug, version } = req.params;
        const versionNum = parseInt(version, 10);

        const logState: any = { params: { slug, version } };

        if (!slug || isNaN(versionNum)) {
            const msg = `Failed to get playground, slug or version is invalid. slug: ${slug}, version: ${version}`;

            req.log.error(logState, msg);
            res.json(CODES.UNPROCESSABLE_ENTITY, { msg });

            next();
            return;
        }

        data.getPlayground(slug, versionNum)
            .then((value) => {
                if (!value) {
                    const msg = `No playground found with slug: ${slug}, or no version ${version} exists.`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else {
                    req.log.debug(`Loaded playground using slug: ${slug}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) => {
                logState.err = err;
                req.log.error(logState, 'Failed to get playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, {
                    msg: `There was an error trying to load playground ${slug}@${version}`,
                });

                next();
            });
    });

    /**
     * POST /
     *
     * Creates a new playground.
     *
     * 201: New playground created, link can be found in Link header.
     * 422: New playground is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the playground.
     */
    app.post('/api', (req, res, next) => {
        const { name, author, isPublic, pixiVersion, contents } = req.body;
        const params = { name, author, isPublic, pixiVersion };

        const logState: any = { params, contentsEmpty: !contents };

        if (!name || !author || !contents) {
            req.log.error(logState, 'Failed to save playground, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, either name, author, or contents is empty.` });

            next();
            return;
        }

        data.createPlayground(params, contents)
            .then((value) => {
                req.log.debug(`Created a new playground: ${value.item.slug}`);
                res.json(CODES.OK, value);

                next();
            })
            .catch((err) => {
                logState.err = err;
                req.log.error(logState, 'Failed to update playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: 'There was an error trying to save the playground.' });

                next();
            });
    });

    /**
     * POST /:slug
     *
     * Updates a playground with a new version.
     *
     * 201: New playground version created, link can be found in Link header.
     * 422: New playground version is invalid, there are validation errors with the sent data.
     * 500: Server error, some error happened when trying to save the playground version.
     */
    app.post('/api/:slug', (req, res, next) => {
        const { slug } = req.params;
        const { name, author, isPublic, pixiVersion, contents } = req.body;
        const params = { name, author, isPublic, pixiVersion };

        const logState: any = { params, contentsEmpty: !contents };

        if (!slug || !name || !author || !contents) {
            req.log.error(logState, 'Failed save playground, invalid params');

            res.json(CODES.UNPROCESSABLE_ENTITY, { msg: `Invalid params, either slug, name, author, or contents is empty.` });

            next();
            return;
        }

        data.createPlaygroundVersion(slug, params, contents)
            .then((value) => {
                if (!value) {
                    const msg = `No playground found with slug: ${slug}.`;

                    req.log.info(logState, msg);
                    res.json(CODES.NOT_FOUND, { msg });
                }
                else {
                    req.log.debug(`Created new playground version using slug: ${slug}, added version: ${value.item.version}`);
                    res.json(CODES.OK, value);
                }

                next();
            })
            .catch((err) => {
                logState.err = err;
                req.log.error(logState, 'Failed to save playground.');
                res.json(CODES.INTERNAL_SERVER_ERROR, { msg: 'There was an error trying to save the playground.' });

                next();
            });
    });
};
