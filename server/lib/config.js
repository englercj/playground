'use strict';

const env = process.env.NODE_ENV || 'development';

module.exports = {
    env,
    isProductionEnv: env === 'production',
    isDevelopmentEnv: env === 'development',
    isTestEnv: env === 'test',
    port: process.env.PORT || 8081,
    host: process.env.HOST || '0.0.0.0',
    region: process.env.REGION || 'us-east-2',
    dbTableName: process.env.DB_TABLE_NAME || 'pixi-playground-items',
    dbIsPublicIndexName: process.env.DB_IS_PUBLIC_INDEX_NAME || 'isPublic-index',
    dbIsFeaturedIndexName: process.env.DB_IS_FEATURED_INDEX_NAME || 'isFeatured-index',
    dbIsOfficialIndexName: process.env.DB_IS_OFFICIAL_INDEX_NAME || 'isOfficial-index',
    s3BucketName: process.env.S3_BUCKET_NAME || 'pixi-playground-items',
    corsOrigin: env === 'production' ? 'pixiplayground.com' : '*',
};
