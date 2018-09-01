import * as corsMiddleware from 'restify-cors-middleware';
import { ISequelizeConfig } from 'sequelize-typescript';

export const env = process.env.NODE_ENV || 'development';

export const isProductionEnv = env === 'production';
export const isTestEnv = env === 'test';
export const port = process.env.PORT || 8081;
export const host = process.env.HOST || '127.0.0.1';
export const region = process.env.REGION || 'nyc1';
export const cors: corsMiddleware.Options = {
    origins: [isProductionEnv ? 'pixiplayground.com' : '*'],
    allowHeaders: [],
    exposeHeaders: [],
};
export const db: ISequelizeConfig = {
    operatorsAliases: false,
    host: process.env.DB_HOSTNAME || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || 'playground',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pixi_playground',
    dialect: isProductionEnv ? 'mysql' : 'sqlite',
    storage: isTestEnv ? ':memory:' : 'data.sqlite',
    define: {
        timestamps: true,
        version: 'lockVersion',
    },
    timezone: 'America/Los_Angeles',
    benchmark: !isProductionEnv,
};
