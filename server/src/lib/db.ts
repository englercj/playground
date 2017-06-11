import * as path from 'path';
import logger from './logger';
import { Sequelize } from 'sequelize-typescript';
import { db as dbConfig } from '../config';

const dbLogger = logger.child({ sequelize: true }, true);

dbConfig.logging = (msg: string, ms: number) => {
    dbLogger.debug({ timing: ms }, msg);
};

const sequelize = new Sequelize(dbConfig);

sequelize.addModels([path.join(__dirname, '..', 'models')]);

export default sequelize;
