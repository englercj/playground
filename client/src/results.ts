const validOrigins = [
    'http://pixiplayground.com',
    'https://pixiplayground.com',
    'http://localhost:8080',
];

let windowLoaded: boolean = false;
let queuedData: TPlaygroundInfo = null;

let lastPixiVersion: string = '';
let lastDemoContents: string = '';
let pixiScriptElement: HTMLScriptElement = null;
let demoScriptElement: HTMLScriptElement = null;

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

    const data: TPlaygroundInfo = event.data;

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

function updateDemo(data: TPlaygroundInfo) {
    updatePixi(data, () => {
        updateDemoCode(data);
    });
}

function updatePixi(data: TPlaygroundInfo, cb: () => void) {
    if (lastPixiVersion === data.item.pixiVersion) {
        cb();

        return;
    }

    // remove old lib element
    if (pixiScriptElement) {
        pixiScriptElement.remove();
    }

    // create new lib element
    pixiScriptElement = document.createElement('script');
    pixiScriptElement.src = `https://d157l7jdn8e5sf.cloudfront.net/${data.item.pixiVersion || 'release'}/pixi.js`;
    pixiScriptElement.onload = cb;

    document.body.appendChild(pixiScriptElement);

    lastPixiVersion = data.item.pixiVersion;
}

function updateDemoCode(data: TPlaygroundInfo) {
    if (lastDemoContents === data.contents) {
        return;
    }

    // remove old demo script
    if (demoScriptElement) {
        demoScriptElement.remove();
    }

    // remove any canvases that were there before
    const canvases = document.getElementsByTagName('canvas');

    for (let i = canvases.length - 1; i >= 0; --i) {
        canvases[i].remove();
    }

    // create demo script
    demoScriptElement = document.createElement('script');
    demoScriptElement.textContent = `${data.contents}\n//# sourceURL=demo.js\n`;

    document.body.appendChild(demoScriptElement);

    lastDemoContents = data.contents;
}
