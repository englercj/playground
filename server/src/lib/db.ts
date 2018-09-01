import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { db as dbConfig } from '../config';
import { dbLogger } from './db-logger';

import { Playground } from '../models/Playground';

dbConfig.logging = (msg: string, ms: number) => {
    dbLogger.debug({ timing: ms }, msg);
};

const sequelize = new Sequelize(dbConfig);

sequelize.addModels([
    Playground,
]);

export const db = sequelize;
