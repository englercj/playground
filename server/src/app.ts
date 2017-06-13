// Include the cluster module
import * as cluster from 'cluster';
import * as os from 'os';
import logger from './lib/logger';
import server from './server';

// Code to run if we're in the master process
if (cluster.isMaster) {
    // Count the machine's CPUs
    let workerCount = os.cpus().length;

    // check for override to cpu count
    for (let i = 0; i < process.argv.length; ++i) {
        if (process.argv[i] === '--workers') {
            if (process.argv.length > i + 1 && process.argv[i + 1]) {
                const workerNum = parseInt(process.argv[i + 1], 10);

                if (workerNum) {
                    workerCount = workerNum;
                }
            }

            break;
        }
    }

    // Create a worker for each CPU
    for (let i = 0; i < workerCount; ++i) {
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
