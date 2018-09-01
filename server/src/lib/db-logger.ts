import { logger } from './logger';

export const dbLogger = logger.child({ sequelize: true }, true);
