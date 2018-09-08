import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { Tag } from './Tag';
import { Playground } from './Playground';

@Table({
    tableName: 'playground_tags',
    modelName: 'playgroundtag',
    timestamps: true,
})
export class PlaygroundTag extends Model<PlaygroundTag>
{
    @ForeignKey(() => Playground)
    @Column
    playgroundId: number;

    @ForeignKey(() => Tag)
    @Column
    tagId: number;
}
