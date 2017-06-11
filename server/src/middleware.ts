import * as restify from 'restify';
import * as os from 'os';
import * as http from 'http';
import * as config from './config';
import logger from './lib/logger';

export default function middlewareInit(app: restify.Server) {
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

    app.on('uncaughtException', (req: restify.Request, res: restify.Response, route: string, error: Error) => {
        req.log.error(error);
    });
};

const Response = (http as any).ServerResponse;

// Add a links property to the response object
Response.prototype.links = function linkHeaderFormatter(links: { [key: string]: string }) {
    let link = this.getHeader('Link') || '';

    if (link) {
        link += ', ';
    }

    const linksStr = Object.keys(links)
        .map((rel) => `<${links[rel]}>; rel="${rel}"`)
        .join(', ');

    return this.setHeader('Link', link + linksStr);
};
