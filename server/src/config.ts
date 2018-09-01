import * as corsMiddleware from 'restify-cors-middleware';
import { ISequelizeConfig } from 'sequelize-typescript';

export const env = process.env.NODE_ENV || 'development';

export const isProductionEnv = env === 'production';
export const isTestEnv = env === 'test';
export const port = process.env.PORT || 8081;
export const host = process.env.HOST || '127.0.0.1';
export const region = process.env.REGION || 'us-east-2';
export const cors: corsMiddleware.Options = {
    origins: [isProductionEnv ? 'pixiplayground.com' : '*'],
    allowHeaders: [],
    exposeHeaders: [],
};
export const db: ISequelizeConfig = {
    operatorsAliases: false,
    host: process.env.RDS_HOSTNAME || 'localhost',
    port: process.env.RDS_PORT ? parseInt(process.env.RDS_PORT, 10) : 5432,
    username: process.env.RDS_USERNAME || 'playground',
    password: process.env.RDS_PASSWORD || '',
    database: process.env.RDS_DB_NAME || 'pixi_playground',
    dialect: isProductionEnv ? 'postgres' : 'sqlite',
    storage: isTestEnv ? ':memory:' : 'data.sqlite',
    define: {
        timestamps: true,
        version: 'lockVersion',
    },
    // timezone: 'America/Los_Angeles',
    benchmark: true,
    native: true,
};
