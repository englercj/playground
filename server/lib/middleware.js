'use strict';

const restify   = require('restify');
const os        = require('os');
const logger    = require('./logger');
const config    = require('./config');

module.exports = function middlewareInit(app) {
    app.pre(restify.pre.sanitizePath());

    app.use(restify.CORS({
        origins: [config.corsOrigin],
    }));

    app.use(restify.requestLogger());

    app.use(restify.queryParser({
        mapParams: true,
    }));

    app.use(restify.bodyParser({
        maxBodySize: 0,
        mapParams: true,
        mapFiles: false,
        overrideParams: false,
        keepExtensions: true,
        multiples: false,
        uploadDir: os.tmpdir(),
    }));

    app.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true,
    }));

    app.on('uncaughtException', (req, res, route, error) => {
        req.log.error(error);
    });
};

const Response = require('http').ServerResponse;

// Add a links property to the response object
Response.prototype.links = function linkHeaderFormatter(links) {
    let link = this.getHeader('Link') || '';

    if (link) {
        link += ', ';
    }

    const linksStr = Object.keys(links)
        .map((rel) => `<${links[rel]}>; rel="${rel}"`)
        .join(', ');

    return this.setHeader('Link', link + linksStr);
};
