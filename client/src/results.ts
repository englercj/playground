import { IPlayground } from '../../shared/types';

const validOrigins = [
    'https://www.pixiplayground.com',
    'https://pixiplayground.com',
    'http://localhost:8080',
];

let windowLoaded: boolean = false;
let queuedData: IPlayground = null;

window.addEventListener('load', handleLoad, false);
window.addEventListener('message', handleMessage, false);

function handleLoad() {
    windowLoaded = true;

    if (queuedData) {
        updateDemo(queuedData);
        queuedData = null;
    }
}

function handleMessage(event: MessageEvent) {
    // Ensure this is a trusted domain
    if (validOrigins.indexOf(event.origin) === -1) {
        return;
    }

    const data: IPlayground = event.data;

    if (!data || !data.contents) {
        return;
    }

    if (windowLoaded) {
        updateDemo(data);
    }
    else {
        queuedData = data;
    }
}

function updateDemo(data: IPlayground) {
    updatePixi(data, () => {
        updateExternalScripts(data, () => {
            updateDemoCode(data);
        });
    });
}

function updatePixi(data: IPlayground, cb: () => void) {
    const script = document.createElement('script');
    script.src = `https://d157l7jdn8e5sf.cloudfront.net/${data.pixiVersion || 'release'}/pixi.js`;
    script.onload = cb;
    script.onerror = cb;

    document.body.appendChild(script);
}

function updateExternalScripts(data: IPlayground, cb: () => void) {
    if (!data.externaljs || data.externaljs.length === 0)
    {
        cb();
        return;
    }

    let loadsDone = 0;
    const loadsNeeded = data.externaljs.length;
    const loadCallback = () => {
        console.log(loadsDone);
        loadsDone++;
        if (loadsDone === loadsNeeded)
            cb();
    };

    for (let i = 0; i < data.externaljs.length; ++i)
    {
        const script = document.createElement('script');
        script.src = data.externaljs[i].url;
        script.onload = loadCallback;
        script.onerror = loadCallback;

        document.body.appendChild(script);
    }
}

function updateDemoCode(data: IPlayground) {
    const script = document.createElement('script');
    script.textContent = `${data.contents}\n//# sourceURL=demo.js\n`;

    document.body.appendChild(script);
}
