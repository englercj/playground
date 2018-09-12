import { IPlayground } from '../../shared/types';
import { PixiVersionType, getPixiVersionType } from './util/pixiVersionType';

const validOrigins = [
    'https://www.pixiplayground.com',
    'https://pixiplayground.com',
    'http://localhost:8080',
];

let windowLoaded: boolean = false;
let queuedData: IPlayground = null;

window.addEventListener('load', handleLoad, false);
window.addEventListener('message', handleMessage, false);

function handleLoad()
{
    windowLoaded = true;

    if (queuedData)
    {
        updateDemo(queuedData);
        queuedData = null;
    }
}

function handleMessage(event: MessageEvent)
{
    // Ensure this is a trusted domain
    if (validOrigins.indexOf(event.origin) === -1)
        return;

    const data: IPlayground = event.data;

    if (!data || !data.contents)
        return;

    if (windowLoaded)
        updateDemo(data);
    else
        queuedData = data;
}

function updateDemo(data: IPlayground)
{
    updateScripts(data, () => updateDemoCode(data));
}

function updateScripts(data: IPlayground, cb: () => void)
{
    let scripts = [];

    // Add pixi version
    const versionType = getPixiVersionType(data.pixiVersion);
    let pixiUrl = '';

    if (versionType === PixiVersionType.Release || versionType === PixiVersionType.Tag)
        pixiUrl = `https://d157l7jdn8e5sf.cloudfront.net/${data.pixiVersion || 'release'}/pixi.js`;
    else
        pixiUrl = data.pixiVersion;

    scripts.push(pixiUrl);

    // Add external scripts
    if (data.externaljs && data.externaljs.length > 0)
        scripts = scripts.concat(data.externaljs.map((v) => v.url));

    // load each in series
    eachSeries(scripts, loadScript, cb);
}

function updateDemoCode(data: IPlayground)
{
    const script = document.createElement('script');
    script.textContent = `${data.contents}\n//# sourceURL=demo.js\n`;

    document.body.appendChild(script);
}

function loadScript(url: string, cb: () => void)
{
    const script = document.createElement('script');
    script.src = url;
    script.onload = cb;
    script.onerror = cb;

    document.body.appendChild(script);
}

type TNextCallback = () => void;
type TIterator<T> = (value: T, next: TNextCallback) => void;
function eachSeries<T>(array: T[], iter: TIterator<T>, done: TNextCallback)
{
    let index = 0;
    const next = () =>
    {
        if (index === array.length)
            return done();

        iter(array[index++], next);
    };

    next();
}
