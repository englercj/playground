// TODO:
// - cache sequelize queries!
// - storage for preview images/animations?

import * as crypto from 'crypto';
import * as config from '../config';
import * as Promise from 'bluebird';
import Playground from '../models/Playground';
import dbClient from './db';
import { Sequelize } from 'sequelize-typescript';
import { loadFile, saveFile } from './files';

export type TPlaygroundInfo = { item: Playground, content: string };

/**
 * Creates a new playground entry.
 *
 */
export function createPlayground(data: IPlaygroundData, contents: string): Promise<TPlaygroundInfo> {
    const item = new Playground(data);

    item.file = getFilename(contents);

    return dbClient.transaction((t) => {
        return item.save({ transaction: t })
            .then(() => saveFile(item.file, contents))
            .then(() => Promise.resolve({ item, contents }));
    });
}

/**
 * Updates an existing playground with a new version.
 *
 */
export function createPlaygroundVersion(id: number, data: IPlaygroundData, contents: string): Promise<TPlaygroundInfo> {
    const item = new Playground(data);

    item.id = id;
    item.file = getFilename(contents);

    return dbClient.transaction((t) => {
        return Playground.max('version', { where: { id: item.id }, transaction: t })
            .then((version) => {
                item.version = version + 1;

                return item.save({ transaction: t });
            })
            .then(() => Promise.resolve({ item, contents }));
    });
}

/**
 * Gets an existing playground.
 *
 */
export function getPlayground(id: number, version: number): Promise<TPlaygroundInfo> {
    return Playground.findOne({ where: { id, version } })
        .then((item: Playground) => {
            if (!item) return Promise.resolve(null);

            return loadFile(item.file)
                .then((contents) => Promise.resolve({ item, contents }));
        })
}

/**
 * Helper function that hashes the contents and sets the `file` property
 *
 */
export function getFilename(contents: string) {
    const hash = crypto.createHash('sha256');

    hash.update(contents);

    return `playground~${hash.digest('hex')}.js`;
}
