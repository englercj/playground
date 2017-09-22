import * as path from 'path';
import * as fs from 'fs';
import { Sequelize } from 'sequelize-typescript';
import { db as dbConfig } from '../config';
import dbLogger from './db-logger';

dbConfig.logging = (msg: string, ms: number) => {
    dbLogger.debug({ timing: ms }, msg);
};

const sequelize = new Sequelize(dbConfig);

const modelPath = path.join(__dirname, '..', 'models');
const files = fs.readdirSync(modelPath);
const models = [];

for (let i = 0; i < files.length; ++i) {
    const file = files[i];
    const ext = path.extname(file);

    if (ext === '.js' || ext === '.ts') {
        models.push(require(path.join(modelPath, file)).default);
    }
}

sequelize.addModels(models);

export default sequelize;
