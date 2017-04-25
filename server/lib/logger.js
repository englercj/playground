'use strict';

const cluster = require('cluster');
const createCWStream = require('bunyan-cloudwatch');
const config = require('./config');

const bunyanConfig = {
    name: 'service',
    level: 'debug',
    region: config.region,
};

if (cluster.isWorker) {
    bunyanConfig.clusterWorkerId = cluster.worker.id;
}

if (config.isProductionEnv) {
    bunyanConfig.level = 'info';
    bunyanConfig.streams = [
        {
            type: 'raw',
            stream: createCWStream({
                logGroupName: 'PIXI_Playground',
                logStreamName: 'App_Server',
                cloudWatchLogsOptions: {
                    region: config.region,
                },
            }),
        },
    ];
}
else if (config.env === 'test') {
    bunyanConfig.level = 'error';
}

module.exports = require('bunyan').createLogger(bunyanConfig);
