import * as cluster from 'cluster';
// import * as createCWStream from 'bunyan-cloudwatch';
import * as config from '../config';
import * as bunyan from 'bunyan';

const bunyanConfig: any = {
    name: 'service',
    level: 'debug',
    serializers: bunyan.stdSerializers,
};

if (cluster.isWorker)
{
    bunyanConfig.clusterWorkerId = cluster.worker.id;
}

if (config.isProductionEnv)
{
    bunyanConfig.level = 'info';
    // bunyanConfig.streams = [
    //     {
    //         type: 'raw',
    //         stream: createCWStream({
    //             logGroupName: config.logGroupName,
    //             logStreamName: config.logStreamName,
    //             cloudWatchLogsOptions: {
    //                 region: config.region,
    //             },
    //         }),
    //     },
    // ];
}
else if (config.isTestEnv)
{
    bunyanConfig.level = 'fatal';
}

export const logger = bunyan.createLogger(bunyanConfig);
