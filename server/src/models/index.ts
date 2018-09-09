import { Sequelize } from 'sequelize-typescript';

import { ExternalJs } from './ExternalJs';
import { Playground } from './Playground';
import { PlaygroundTag } from './PlaygroundTag';
import { Tag } from './Tag';

export function setupModels(db: Sequelize)
{
    db.addModels([
        ExternalJs,
        Playground,
        PlaygroundTag,
        Tag,
    ]);
}
