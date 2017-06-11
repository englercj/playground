// Include the cluster module
import * as cluster from 'cluster';
import * as os from 'os';
import logger from './lib/logger';
import server from './server';

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    const cpuCount = os.cpus().length;

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
    server.start();
}
