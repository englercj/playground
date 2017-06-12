import { Sequelize } from 'sequelize-typescript';
import { Table, Column, Model, CreatedAt, UpdatedAt, DataType } from 'sequelize-typescript';
import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';

@Table({
    tableName: 'playgrounds',
    modelName: 'playground',
    timestamps: true,
    indexes: [
        { fields: ['isFeatured'], where: { isFeatured: true } },
        { fields: ['isOfficial'], where: { isOfficial: true } },
    ] as any // 'where' is not in the dts :(
} as IDefineOptions)
export default class Playground extends Model<Playground> implements IPlaygroundData {
    /**
     * The primary ID key. Together the ID/Version uniquely identify a playground.
     * When creating a brand new playground, the ID is incremented.
     *
     */
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: 'unique_id_version',
    })
    id: number;

    /**
     * The primary version key. Together the ID/Version uniquely identify a playground.
     * When editing or updating an existing playground, the version is incremented.
     *
     */
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        unique: 'unique_id_version',
    })
    version: number;

    /**
     * The user-defined name of the playground.
     *
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    /**
     * The file URL for the playground contents.
     *
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    file: string;

    /**
     * The user-define author string.
     *
     */
    @Column({
        type: DataType.STRING,
    })
    author: string;

    /**
     * The count of stars a playground has.
     *
     */
    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    starCount: number;

    /**
     * The version of pixi this playground is built for.
     *
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    pixiVersion: string;

    /**
     * If public is `true` (default) it will be indexed by the search engine. "Secret"
     * playgrounds are still visible to anyone, but are not indexed into the search engine.
     *
     */
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isPublic: boolean;

    /**
     * If features is `true` the playground can appear in the front-page featured section.
     *
     */
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isFeatured: boolean;

    /**
     * If official is `true` the playground can appear in the front-page official section.
     * Additionally, it can be marked as an official "example".
     *
     */
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
    })
    isOfficial: boolean;

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
