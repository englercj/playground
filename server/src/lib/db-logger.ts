import logger from './logger';

export default logger.child({ sequelize: true }, true);
