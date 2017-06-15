// Include the cluster module
import * as os from 'os';
import * as path from 'path';
import * as cluster from 'cluster';
import * as Umzug from 'umzug';
import logger from './lib/logger';
import db from './lib/db';
import server from './server';

// Code to run if we're in the master process
if (cluster.isMaster) {
    const umzugLogger = logger.child({ umzug: true }, true);
    const umzug = new Umzug({
        storage: 'sequelize',
        storageOptions: {
            sequelize: db,
            tableName: 'schema_migrations',
            columnName: 'migration',
        },
        logging: (msg: string) => {
            umzugLogger.info(msg);
        },
        migrations: {
            path: path.join(__dirname, 'migrations'),
            pattern: /^\d+[\w-]+\.(j|t)s$/,
            params: [db.getQueryInterface(), db.constructor],
        },
    });

    umzug.up()
        .then(forkWorkers)
        .catch((e) => {
            logger.fatal(e, 'Umzug migration failure.');
            process.exit(1);
        });
}
// Code to run if we're in a worker process
else {
    server.start();
}

function forkWorkers() {
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
