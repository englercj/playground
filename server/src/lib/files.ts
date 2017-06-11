import * as Promise from 'bluebird';
import * as config from '../config';
import { loadFile as loadFileS3, saveFile as saveFileS3 } from './files-s3';
import { loadFile as loadFileFS, saveFile as saveFileFS } from './files-fs';

export let loadFile: (filename: string) => Promise<string> = null;
export let saveFile: (filename: string, contents: string) => Promise<void> = null;

if (config.isProductionEnv) {
    loadFile = loadFileS3;
    saveFile = saveFileS3;
}
else {
    loadFile = loadFileFS;
    saveFile = saveFileFS;
}
