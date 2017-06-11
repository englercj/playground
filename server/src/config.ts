export const env = process.env.NODE_ENV || 'development';

export const isProductionEnv = env === 'production';
export const isTestEnv = env === 'test';
export const port = process.env.PORT || 8081;
export const host = process.env.HOST || '127.0.0.1';
export const region = process.env.REGION || 'us-east-2';
export const logGroupName = process.env.APP_LOGS_GROUP_NAME || 'PIXI_Playground';
export const logStreamName = process.env.APP_LOGS_STREAM_NAME || 'App_Server';
export const s3BucketName = process.env.S3_BUCKET_NAME || 'pixi-playground-items';
export const corsOrigin = isProductionEnv ? 'pixiplayground.com' : '*';
export const db: any = {
    name: '',
    host: process.env.RDS_HOSTNAME || 'localhost',
    port: process.env.RDS_PORT || 5432,
    username: process.env.RDS_USERNAME || 'playground',
    password: process.env.RDS_PASSWORD || '',
    database: process.env.RDS_DB_NAME || 'pixi_playground',
    dialect: isProductionEnv ? 'postgres' : 'sqlite',
    storage: isTestEnv ? ':memory:' : 'data.sqlite',
    define: {
        timestamps: true,
        version: '_lockVersion',
    },
    timezone: 'America/Los_Angeles',
    benchmark: true,
    native: true,
};
