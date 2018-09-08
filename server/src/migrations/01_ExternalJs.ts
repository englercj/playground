import nanoid = require('nanoid');
import { QueryInterface, DataTypes } from 'sequelize';

export function up(query: QueryInterface, DataTypes: DataTypes) {
    return query.addColumn('playgrounds', 'externalJs', {
        type: DataTypes.TEXT,
        allowNull: true,
    });
}

export function down(query: QueryInterface) {
    return query.removeColumn('playgrounds', 'externalJs');
}
