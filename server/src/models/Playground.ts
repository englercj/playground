import * as shortid from 'shortid';
import * as Promise from 'bluebird';
import { Sequelize } from 'sequelize-typescript';
import { Table, Column, Model, CreatedAt, UpdatedAt, DataType } from 'sequelize-typescript';
import { IDefineOptions } from 'sequelize-typescript/lib/interfaces/IDefineOptions';
import { db as dbConfig } from '../config';
import db from '../lib/db';
import dbLogger from '../lib/db-logger';

const searchQuery: { [dialect: string]: string } = {
    postgres: '"PlaygroundSearchText" @@ plainto_tsquery(\'english\', ?)',
    sqlite: 'playgrounds_fts MATCH ?',
    // mysql: 'MATCH (name, description, author) AGAINST(?)',
};

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
        type: DataType.CHAR,
        allowNull: false,
        defaultValue: () => shortid.generate(),
        unique: 'unique_slug_version',
    })
    slug: string;

    /**
     * The primary version key. Together the ID/Version uniquely identify a playground.
     * When editing or updating an existing playground, the version is incremented.
     *
     */
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        unique: 'unique_slug_version',
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
     * The user-defined description of the playground.
     *
     */
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    description: string;

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

    /**
     * Search the pg full-text search index for the query.
     *
     */
    static search(searchStr: string): Promise<Playground[]>
    {
        if (!searchQuery[db.options.dialect])
        {
            dbLogger.warn('Attempt to run search on non POSTGRES database.');
            return Promise.reject(new Error('Searching not supported in this dialect'));
        }

        const escapedStr = db.getQueryInterface().escape(searchStr);
        const whereClause = searchQuery[dbConfig.dialect].replace('?', escapedStr);
        const tableName = Playground.getTableName();
        const tableNamePostfix = db.options.dialect === 'sqlite' ? '_fts' : '';

        return db.query(`SELECT * FROM ${tableName}${tableNamePostfix} WHERE ${whereClause}`, { type: Sequelize.QueryTypes.SELECT });
    }
}
