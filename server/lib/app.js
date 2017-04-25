/* eslint-disable global-require */
'use strict';

// Include the cluster module
const cluster = require('cluster');
const logger = require('./logger');

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    const cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; ++i) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', (worker, code, signal) => {
        // Replace the terminated workers
        logger.error(`Worker ${worker.id} exited (${signal || code}), restarting...`);
        cluster.fork();
    });
}
// Code to run if we're in a worker process
else {
    require('./server');
}
