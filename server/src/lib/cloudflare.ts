import * as https from 'https';
import * as CODES from 'http-codes';
import * as bunyan from 'bunyan';
import { isProductionEnv, cloudflare } from '../config';

export function purgeEntireCache(log: bunyan)
{
    if (!isProductionEnv)
        return;

    const postData = JSON.stringify({ purge_everything: true });

    requestCachePurge(log, postData);
}

export function purgeCacheForUrls(log: bunyan, urls: string[])
{
    if (!isProductionEnv)
        return;

    const postData = JSON.stringify({ files: urls });

    requestCachePurge(log, postData);
}

function requestCachePurge(log: bunyan, postData: any)
{
    const logState: any = { postData };

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
                {
                    logState.code = res.statusCode;
                    logState.headers = res.headers;
                    return log.error(logState, `Failed to purge Cloudflare cache.`);
                }

                try
                {
                    let resBody = JSON.parse(resStr);

                    logState.resBody = resBody;

                    if (resBody.success)
                        log.info(logState, `Successfully purged Cloudflare cache.`);
                    else
                        log.error(logState, `Failed to purge Cloudflare cache.`);
                }
                catch (e)
                {
                    logState.err = e;
                    log.error(logState, `Failed to parse response from Cloudflare API during cache purge.`);
                }
            });
        });

    cfReq.on('error', (err) =>
    {
        logState.err = err;
        log.error(logState, `Failed to purge cache..`);
    });

    cfReq.write(postData);
    cfReq.end();
}
