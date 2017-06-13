import * as cluster from 'cluster';
import * as createCWStream from 'bunyan-cloudwatch';
import * as config from '../config';

const bunyanConfig: any = {
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
                logGroupName: config.logGroupName,
                logStreamName: config.logStreamName,
                cloudWatchLogsOptions: {
                    region: config.region,
                },
            }),
        },
    ];
}
else if (config.isTestEnv) {
    bunyanConfig.level = 'fatal';
}

export default (require('bunyan').createLogger(bunyanConfig));
