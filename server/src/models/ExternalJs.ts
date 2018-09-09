import { Table, Column, Model, CreatedAt, UpdatedAt, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Playground } from './Playground';

@Table({
    tableName: 'external_js',
    modelName: 'external_js',
    timestamps: true,
})
export class ExternalJs extends Model<ExternalJs>
{
    /**
     * The user-defined name of the tag.
     *
     */
    @Column({
        type: DataType.STRING(1023),
        allowNull: false,
    })
    url: string;

    /**
     * The playground this external js object belongs to.
     *
     */
    @ForeignKey(() => Playground)
    @Column
    playgroundId: number;

    @BelongsTo(() => Playground)
    playground: Playground;

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
