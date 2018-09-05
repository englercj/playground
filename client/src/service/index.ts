import { IPlayground } from '../../../shared/types';
import { get, put, post, THttpCallback } from './http';

const pixiTypingsCache: { [key: string]: string } = {};

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
    if (pixiTypingsCache[version])
    {
        setTimeout(() => cb(pixiTypingsCache[version]), 1);
        return;
    }

    if (version === 'release')
        version = 'master';

    const url = `https://cdn.rawgit.com/pixijs/pixi-typescript/${version}/pixi.js.d.ts`;

    get(url, (err, str) =>
    {
        if (!err)
        {
            pixiTypingsCache[version] = str;
            cb(str);
        }
        else
        {
            cb(null);
        }
    });
}
