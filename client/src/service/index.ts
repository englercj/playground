import http, { THttpCallback } from './http';

const pixiTypingsUrls: { [key: string]: string } = {
    v4: 'https://cdn.rawgit.com/pixijs/pixi-typescript/v4.x/pixi.js.d.ts',
    v3: 'https://cdn.rawgit.com/pixijs/pixi-typescript/a7bbf609/pixi.js.d.ts',
    v2: 'https://cdn.rawgit.com/pixijs/pixi-typescript/v2.x/pixi.d.ts',
};

let baseOrigin = '';

if (typeof localStorage !== 'undefined') {
    const apiOriginOverride = localStorage.getItem('apiOriginOverride');

    if (apiOriginOverride) {
        baseOrigin = apiOriginOverride;
    }
}

export function createPlayground(name: string, author: string, isPublic: boolean, contents: string, cb: THttpCallback) {
    http.post(`${baseOrigin}/api`, { name, author, isPublic, contents }, cb);
}

export function updatePlayground(id: string, name: string, author: string, isPublic: boolean, contents: string, cb: THttpCallback) {
    http.post(`${baseOrigin}/api/${id}`, { name, author, isPublic, contents }, cb);
}

export function getPlayground(id: string, version: number, cb: THttpCallback) {
    http.get(`${baseOrigin}/api/${id}/${version}`, cb);
}

export function getTypings(key: string, cb: THttpCallback) {
    if (!pixiTypingsUrls[key]) return cb(new Error('Invalid version key.'));

    http.get(pixiTypingsUrls[key], cb);
}
