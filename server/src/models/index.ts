import { Sequelize } from 'sequelize-typescript';

import { Playground } from './Playground';
import { PlaygroundTag } from './PlaygroundTag';
import { Tag } from './Tag';

export function setupModels(db: Sequelize)
{
    db.addModels([
        Playground,
        PlaygroundTag,
        Tag,
    ]);
}
