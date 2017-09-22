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
        description: {
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
    } as any))
    .then(() => {
        const tableName = 'playgrounds';
        const vectorName = 'PlaygroundSearchText';
        const searchFields = ['name', 'description', 'author'];

        if (query.sequelize.options.dialect.toLowerCase() == 'postgres') {
            return query.sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN "${vectorName}" TSVECTOR;`)
                .then(() => query.sequelize.query(`UPDATE "${tableName}" SET "${vectorName}" = to_tsvector('english', '${searchFields.join('\' || \'')}');`))
                .then(() => query.sequelize.query(`CREATE INDEX idx_playgrounds_search ON "${tableName}" USING gin("${vectorName}");`))
                .then(() => query.sequelize.query(`CREATE TRIGGER trigger_playgrounds_vector_update BEFORE INSERT OR UPDATE ON "${tableName}" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("${vectorName}", 'pg_catalog.english', '${searchFields.join(', ')});`));
        }
        else if (query.sequelize.options.dialect.toLowerCase() == 'sqlite') {
            return query.sequelize.query(`CREATE VIRTUAL TABLE ${tableName}_fts USING fts4(${searchFields.join(', ')});`)
                .then(() => query.sequelize.query(`
                    CREATE TRIGGER trigger_${tableName}_bu BEFORE UPDATE ON ${tableName} BEGIN
                        DELETE FROM ${tableName}_fts WHERE docid=old.rowid;
                    END;
                    CREATE TRIGGER trigger_${tableName}_bd BEFORE DELETE ON ${tableName} BEGIN
                        DELETE FROM ${tableName}_fts WHERE docid=old.rowid;
                    END;
                    CREATE TRIGGER trigger_${tableName}_au AFTER UPDATE ON ${tableName} BEGIN
                        INSERT INTO ${tableName}_fts(docid, ${searchFields.join(', ')}) VALUES(new.rowid, new.${searchFields.join(', new.')});
                    END;
                    CREATE TRIGGER trigger_${tableName}_ai AFTER INSERT ON ${tableName} BEGIN
                        INSERT INTO ${tableName}_fts(docid, ${searchFields.join(', ')}) VALUES(new.rowid, new.${searchFields.join(', new.')});
                    END;
                `))
        }
        else {
            // TODO: MySQL?
            return Promise.resolve();
        }
    })
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
        .then(() => query.dropTable('playgrounds'))
        .then(() => query.sequelize.options.dialect == 'sqlite' ? query.dropTable('playgrounds_fts') : Promise.resolve());
}
