import { Table, Column, Model, CreatedAt, UpdatedAt, BelongsToMany, DataType } from 'sequelize-typescript';
import { ITag } from '../../../shared/types';
import { Playground } from './Playground';
import { PlaygroundTag } from './PlaygroundTag';

@Table({
    tableName: 'tags',
    modelName: 'tag',
    timestamps: true,
})
export class Tag extends Model<Tag> implements ITag
{
    @BelongsToMany(() => Playground, () => PlaygroundTag)
    playgrounds: Playground[];

    /**
     * The user-defined name of the tag.
     *
     */
    @Column({
        type: DataType.STRING(255),
    })
    name: string;

    /**
     * The date this record was created.
     *
     */
    @CreatedAt
    createdAt: Date;

    /**
     * The date this record was last updated.
     *
     */
    @UpdatedAt
    updatedAt: Date;
}
