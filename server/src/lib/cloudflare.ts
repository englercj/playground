import * as https from 'https';
import * as CODES from 'http-codes';
import * as bunyan from 'bunyan';
import { isProductionEnv, cloudflare } from '../config';

export function purgeEntireCache(log: bunyan): Promise<void>
{
    if (!isProductionEnv)
        return;

    const postData = JSON.stringify({ purge_everything: true });

    return requestCachePurge(log, postData);
}

export function purgeCacheForUrls(log: bunyan, urls: string[]): Promise<void>
{
    if (!isProductionEnv)
        return;

    const postData = JSON.stringify({ files: urls });

    return requestCachePurge(log, postData);
}

function requestCachePurge(log: bunyan, postData: any): Promise<void>
{
    return new Promise((resolve, reject) =>
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
                        log.error(logState, `Failed to purge Cloudflare cache.`);
                        reject(new Error('Got non-200 status code from Cloudflare when trying to purge.'));
                        return;
                    }

                    try
                    {
                        let resBody = JSON.parse(resStr);

                        logState.resBody = resBody;

                        if (resBody.success)
                        {
                            log.info(logState, `Successfully purged Cloudflare cache.`);
                            resolve();
                        }
                        else
                        {
                            log.error(logState, `Failed to purge Cloudflare cache.`);
                            reject(new Error('Got a success=false response from Cloudflare when trying to purge.'));
                        }
                    }
                    catch (e)
                    {
                        logState.err = e;
                        log.error(logState, `Failed to parse response from Cloudflare API during cache purge.`);
                        reject(new Error('Failed to parse response from Cloudflare when trying to purge.'));
                    }
                });
            });

        cfReq.on('error', (err) =>
        {
            logState.err = err;
            log.error(logState, `Failed to purge cache..`);
            reject(err);
        });

        cfReq.write(postData);
        cfReq.end();
    });
}
