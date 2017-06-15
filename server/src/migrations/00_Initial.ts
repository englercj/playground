import * as shortid from 'shortid';
import { QueryInterface, DataTypes } from 'sequelize';

export function up(query: QueryInterface, DataTypes: DataTypes) {
    return query.createTable('playgrounds', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        slug: {
            type: DataTypes.CHAR,
            allowNull: false,
            defaultValue: () => shortid.generate(),
            unique: 'unique_slug_version',
        },
        version: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            unique: 'unique_slug_version',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        file: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
        },
        starCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        pixiVersion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isOfficial: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    })
    .then(() => query.addIndex('playgrounds', ['isFeatured'], {
        where: {
            isFeatured: true,
        },
    } as any))
    .then(() => query.addIndex('playgrounds', ['isOfficial'], {
        where: {
            isOfficial: true,
        },
    } as any));
}

export function down(query: QueryInterface) {
    return query.dropTable('playgrounds');
}
