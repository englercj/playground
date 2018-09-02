import nanoid = require('nanoid');
import { QueryInterface, DataTypes } from 'sequelize';

export function up(query: QueryInterface, DataTypes: DataTypes) {
    return query.createTable('playgrounds', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        slug: {
            type: DataTypes.CHAR(63),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(1023),
        },
        description: {
            type: DataTypes.STRING(4095),
        },
        contents: {
            type: DataTypes.TEXT('medium'),
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING(511),
        },
        versionsCount: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        starCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        pixiVersion: {
            type: DataTypes.STRING(255),
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
        lockVersion: {
            type: DataTypes.INTEGER,
        },
    })
    .then(() => query.addIndex('playgrounds', {
        name: 'playgrounds_unique_slug',
        type: 'UNIQUE',
        fields: ['slug'],
    } as any))
    .then(() => query.addIndex('playgrounds', {
        name: 'playgrounds_is_featured',
        fields: ['isFeatured'],
        where: {
            isFeatured: true,
        },
    } as any))
    .then(() => query.addIndex('playgrounds', {
        name: 'playgrounds_is_official',
        fields: ['isOfficial'],
        where: {
            isOfficial: true,
        },
    } as any))
    .then(() => query.addIndex('playgrounds', {
        name: 'fulltext_name_description_author',
        type: 'FULLTEXT',
        fields: ['name', 'description', 'author'],
    } as any))
    .then(() => query.createTable('tags', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }))
    .then(() => query.createTable('playground_tags', {
        playgroundId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'playgrounds',
                key: 'id',
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
        tagId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'tags',
                key: 'id',
            },
        },
    }))
}

export function down(query: QueryInterface) {
    return query.dropTable('playground_tags')
        .then(() => query.dropTable('tags'))
        .then(() => query.dropTable('playgrounds'));
}
