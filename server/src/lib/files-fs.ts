import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as config from '../config';
import * as Promise from 'bluebird';

export function loadFile(filename: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path.join(os.tmpdir(), filename), 'utf8', (err, contents) => {
            if (err) reject(err);
            else resolve(contents);
        });
    });
}

export function saveFile(filename: string, contents: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.writeFile(path.join(os.tmpdir(), filename), contents, 'utf8', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
