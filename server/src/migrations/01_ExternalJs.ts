import nanoid = require('nanoid');
import { QueryInterface, DataTypes } from 'sequelize';

export function up(query: QueryInterface, DataTypes: DataTypes) {
    return query.createTable('external_js', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        url: {
            type: DataTypes.STRING(1023),
            allowNull: false,
        },
        playgroundId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'playgrounds',
                key: 'id',
            },
            onDelete: 'cascade',
            onUpdate: 'cascade',
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
    });
}

export function down(query: QueryInterface) {
    return query.dropTable('external_js');
}
