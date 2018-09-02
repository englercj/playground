import { Sequelize } from 'sequelize-typescript';

import { Playground } from './Playground';

export function setupModels(db: Sequelize)
{
    db.addModels([
        Playground,
    ]);
}
