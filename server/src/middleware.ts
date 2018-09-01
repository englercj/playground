import * as restify from 'restify';
import * as os from 'os';
import * as http from 'http';
import * as config from './config';
import * as corsMiddleware from 'restify-cors-middleware';

export function setupMiddleware(app: restify.Server)
{
    const cors = corsMiddleware({
        origins: [config.corsOrigin],
    });

    app.pre(cors.preflight);
    app.pre(restify.pre.sanitizePath());

    app.use(cors.actual);

    app.use(restify.plugins.requestLogger());

    app.use(restify.plugins.queryParser({
        mapParams: true,
    }));

    app.use(restify.plugins.jsonBodyParser({
        mapParams: true,
        overrideParams: false,
    }));

    app.use(restify.plugins.throttle({
        burst: 100,
        rate: 50,
        ip: true,
    }));

    app.on('uncaughtException', (req: restify.Request, res: restify.Response, route: string, error: Error) =>
    {
        req.log.error(error);
    });
};

const Response = (http as any).ServerResponse;

// Add a links property to the response object
Response.prototype.links = function linkHeaderFormatter(links: { [key: string]: string })
{
    let link = this.getHeader('Link') || '';

    if (link)
        link += ', ';

    const linksStr = Object.keys(links)
        .map((rel) => `<${links[rel]}>; rel="${rel}"`)
        .join(', ');

    return this.setHeader('Link', link + linksStr);
};
