import nanoid = require('nanoid');
import { QueryInterface, DataTypes } from 'sequelize';

export function up(query: QueryInterface, DataTypes: DataTypes) {
    return query.addColumn('playgrounds', 'autoUpdate', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    });
}

export function down(query: QueryInterface) {
    return query.removeColumn('playgrounds', 'autoUpdate');
}
