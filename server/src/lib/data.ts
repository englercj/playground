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
    return savePlayground(new Playground(data), contents);
}

/**
 * Updates an existing playground with a new version.
 *
 */
export function createPlaygroundVersion(id: number, data: IPlaygroundData, contents: string): Promise<TPlaygroundInfo> {
    const newPlayground = new Playground(data);

    newPlayground.id = id;

    return savePlayground(newPlayground, contents);
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
 * Helper function that saves a playground item.
 *
 */
function savePlayground(item: Playground, contents: string): Promise<TPlaygroundInfo> {
    const hash = crypto.createHash('sha256');

    hash.update(contents);

    item.file = `playground~${hash.digest('hex')}.js`;

    return dbClient.transaction((t) => {
        return item.save({ transaction: t })
            .then(() => saveFile(item.file, contents))
            .then(() => Promise.resolve({ item, contents }));
    });
}
