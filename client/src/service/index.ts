import { IPlayground } from '../../../shared/types';
import { get, put, post, THttpCallback } from './http';
import { Storage } from '../util/Storage';
import { getPixiVersionType, PixiVersionType } from '../util/pixiVersionType';

let baseOrigin = __BASE_ORIGIN__;

if (typeof localStorage !== 'undefined') {
    const apiOriginOverride = localStorage.getItem('apiOriginOverride');

    if (apiOriginOverride)
    {
        baseOrigin = apiOriginOverride;
    }
}

export function searchPlaygrounds(searchStr: string, cb: THttpCallback<IPlayground[]>)
{
    get(`${baseOrigin}/api/playgrounds?q=${encodeURIComponent(searchStr)}`, cb);
}

export function getPlayground(slug: string, cb: THttpCallback<IPlayground>)
{
    get(`${baseOrigin}/api/playground/${slug}`, cb);
}

export function createPlayground(data: IPlayground, cb: THttpCallback<IPlayground>)
{
    post(`${baseOrigin}/api/playground`, data, cb);
}

export function updatePlayground(data: IPlayground, cb: THttpCallback<IPlayground>)
{
    put(`${baseOrigin}/api/playground/${data.slug}`, data, cb);
}

export function getReleases(cb: THttpCallback<string[]>)
{
    get(`https://api.github.com/repos/pixijs/pixi.js/tags`, (err, res) =>
    {
        if (err)
            return cb(err);

        if (!res || !Array.isArray(res))
            return cb(new Error('Invalid response from server.'));

        const tags: string[] = [];

        for (let i = 0; i < res.length; ++i)
        {
            tags.push(res[i].name);
        }

        cb(null, tags);
    });
}

export function getTypings(version: string, cb: (typings: string) => void)
{
    let url = '';

    if (version.indexOf('v4') === 0)
        url = `/definitions/${version}/pixi.d.ts`;
    else if (version.indexOf('v5.0.') === 0 && parseInt(version.split('.')[2], 10) < 5)
        url = `/definitions/${version}/pixi.js.d.ts`;
    else if (version === 'master')
        url = `/definitions/master/pixi.js.d.ts`; // Temp, remove when we can use pixijs.download
    else
        url = `https://pixijs.download/${version}/types/pixi.js.d.ts`;

    const cacheable = getPixiVersionType(version) === PixiVersionType.Tag;

    if (cacheable)
    {
        const cachedTypings = Storage.get(url);

        if (cachedTypings)
        {
            setTimeout(() => cb(cachedTypings), 1);
            return;
        }
    }

    get(url, (err, str) =>
    {
        if (!err)
        {
            if (cacheable)
                Storage.set(url, str);

            cb(str);
        }
        else
        {
            cb(null);
        }
    });
}
