import nanoid = require('nanoid');
import { literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Table, Column, Model, CreatedAt, UpdatedAt, DataType, BelongsToMany, HasMany } from 'sequelize-typescript';
import { db as dbConfig } from '../config';
import { db } from '../lib/db';
import { dbLogger } from '../lib/db-logger';
import { IPlayground } from '../../../shared/types';
import { Tag } from './Tag';
import { PlaygroundTag } from './PlaygroundTag';
import { ExternalJs } from './ExternalJs';

const searchQuery: { [dialect: string]: literal } = {
    postgres: Sequelize.literal('"PlaygroundSearchText" @@ plainto_tsquery(\'english\', :search)'),
    sqlite: Sequelize.literal('(name LIKE :search) OR (description LIKE :search) OR (author LIKE :search)'),
    mysql: Sequelize.literal('MATCH (name, description, author) AGAINST(:search)'),
};

@Table({
    tableName: 'playgrounds',
    modelName: 'playground',
    timestamps: true,
})
export class Playground extends Model<Playground> implements IPlayground
{
    @BelongsToMany(() => Tag, () => PlaygroundTag)
    tags: Tag[];

    @HasMany(() => ExternalJs)
    externaljs: ExternalJs[];

    /**
     * A unique identifier that is used in the URL when referring to a Playground.
     *
     */
    @Column({
        type: DataType.CHAR(63),
        allowNull: false,
        defaultValue: () => nanoid(),
        unique: 'unique_slug',
        // unique: 'unique_slug_version',
    })
    slug: string;

    /**
     * The user-defined name of the playground.
     *
     */
    @Column({
        type: DataType.STRING(1023),
    })
    name: string;

    /**
     * The user-defined description of the playground.
     *
     */
    @Column({
        type: DataType.STRING(4095),
    })
    description: string;

    /**
     * The playground contents.
     *
     */
    @Column({
        type: DataType.TEXT('medium'),
        allowNull: false,
    })
    contents: string;

    /**
     * The user-define author string.
     *
     */
    @Column({
        type: DataType.STRING(511),
    })
    author: string;

    /**
     * The count of stars a playground has.
     *
     */
    @Column({
        type: DataType.INTEGER,
        defaultValue: 1,
    })
    versionsCount: number;

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
        type: DataType.STRING(255),
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
     * If autoUpdate is `true` (default) the preview pane will update automatically
     * on a timed interval.
     *
     */
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    autoUpdate: boolean;

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

    /**
     * Search the pg full-text search index for the query.
     *
     */
    static search(search: string): Promise<Playground[]>
    {
        if (!searchQuery[db.options.dialect])
        {
            dbLogger.warn('Attempt to run search on non POSTGRES database.');
            return Promise.reject(new Error('Searching not supported in this dialect'));
        }

        return Playground.findAll({
            where: searchQuery[dbConfig.dialect],
            replacements: { search },
            // include: [Tag,ExternalJs],
        } as any) as any; // looks like types are wrong for findAll params, and Bluebird is not compat with raw promises
    }
}
