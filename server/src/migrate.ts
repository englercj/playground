import * as path from 'path';
import * as Umzug from 'umzug';
import { logger } from './lib/logger';
import { db } from './lib/db';

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
        params: [db.getQueryInterface()],
    },
});

umzug.up()
    .then(() => db.close())
    .catch((e) => {
        logger.fatal(e, 'Umzug migration failure.');
        process.exit(1);
    });
