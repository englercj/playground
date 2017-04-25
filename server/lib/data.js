'use strict';

// TODO:
// - getPublicPlaygrounds
// - getFeaturedPlaygrounds
// - getOfficialPlaygrounds
// - deletePlayground(id, version)
// - deletePlayground(id) - all versions
// - cache dynamodb queries!
// - preview images/animations?
// - automatic retry when retryable = true, that honmors retryDelay
// - trace timings would be useful to track expensive queries and live issues (aws xray?)

/* eslint-disable consistent-return,max-params */

const AWS = require('aws-sdk');
const shortid = require('shortid');
const config = require('./config');

AWS.config.update({ region: config.region });

// create clients
const dbClient = new AWS.DynamoDB.DocumentClient();
const s3Client = new AWS.S3();

module.exports = {
    /**
     * Creates a new playground entry.
     *
     * @param {string} name The name of the new playground.
     * @param {string} author The author of the new playground.
     * @param {boolean} isPublic Is this playground public?
     * @param {boolean} isFeatured Is this playground featured?
     * @param {boolean} isOfficial Is this playground official?
     * @param {string} contents The contents of the playground.
     * @param {Function} cb Callback to call once the data has been saved.
     */
    createPlayground(name, author, isPublic, isFeatured, isOfficial, contents, cb) {
        savePlayground(
            createItemData(shortid.generate(), 0, name, author, isPublic, isFeatured, isOfficial),
            contents,
            (err, item, contents) => {
                if (err) {
                    // duplicate ids were generated, lets try again by generating a new id.
                    // This has an extremely low chance of happening, but we check just in case.
                    if (err.code === 'ConditionalCheckFailedException') {
                        module.exports.createPlayground(name, author, isPublic, contents, cb);
                    }
                    // general error
                    else {
                        cb(err);
                    }
                }
                else {
                    cb(null, item, contents);
                }
            }
        );
    },

    /**
     * Updates an existing playground with a new version.
     *
     * @param {string} id The ID of the existing playground.
     * @param {string} name The name of the new version.
     * @param {string} author The author of the new version.
     * @param {boolean} isPublic Is this playground public?
     * @param {boolean} isFeatured Is this playground featured?
     * @param {boolean} isOfficial Is this playground official?
     * @param {string} contents The contents of the playground.
     * @param {Function} cb Callback to call once the data has been saved.
     */
    createPlaygroundVersion(id, name, author, isPublic, isFeatured, isOfficial, contents, cb) {
        getNextVersion(id, (err, version) => {
            if (err) return cb(err);

            savePlayground(
                createItemData(id, version, name, author, isPublic, isFeatured, isOfficial),
                contents,
                (err, item, contents) => {
                    if (err) {
                        // we raced someone to save this version and lost, try again with the new version number.
                        if (err.code === 'ConditionalCheckFailedException') {
                            module.exports.createPlaygroundVersion(id, name, author, isPublic, contents, cb);
                        }
                        // general error
                        else {
                            cb(err);
                        }
                    }
                    else {
                        cb(null, item, contents);
                    }
                }
            );
        });
    },

    /**
     * Increment an existing playground star count and return the new record.
     *
     * @param {string} id The ID of the existing playground.
     * @param {number} version The version of the existing playground.
     * @param {Function} cb Callback to call once the data has been saved.
     */
    getPlaygroundDataAndIncrementStarCount(id, version, cb) {
        dbClient.update({
            TableName: config.dbTableName,
            Key: { id, version },
            UpdateExpression: 'set starCount = starCount + :val',
            ExpressionAttributeValues: { ':val': 1 },
            ReturnValues: 'ALL_NEW',
        }, (err, data) => {
            // ValidationException will happen when the 'starCount' attribute doesn't exist.
            // The only time that will happen is if the document itself doesn't exist.
            if (err && err.code !== 'ValidationException') return cb(err);

            cb(null, data);
        });
    },

    /**
     * Increment an existing playground view count and return the new record.
     *
     * @param {string} id The ID of the existing playground.
     * @param {number} version The version of the existing playground.
     * @param {Function} cb Callback to call once the data has been saved.
     */
    getPlaygroundDataAndIncrementViewCount(id, version, cb) {
        dbClient.update({
            TableName: config.dbTableName,
            Key: { id, version },
            UpdateExpression: 'set viewCount = viewCount + :val',
            ExpressionAttributeValues: { ':val': 1 },
            ReturnValues: 'ALL_NEW',
        }, (err, data) => {
            // ValidationException will happen when the 'viewCount' attribute doesn't exist.
            // The only time that will happen is if the document itself doesn't exist.
            if (err && err.code !== 'ValidationException') return cb(err);

            cb(null, data);
        });
    },

    /**
     * Gets an existing playground.
     *
     * @param {string} id The ID of the existing playground.
     * @param {number} version The version to get.
     * @param {Function} cb Callback to call once the data has been saved.
     */
    getPlayground(id, version, cb) {
        module.exports.getPlaygroundDataAndIncrementViewCount(id, version, (err, data) => {
            if (err) return cb(err);
            if (!data || !data.Attributes) return cb();

            s3Client.getObject({
                Bucket: config.s3BucketName,
                Key: data.Attributes.file,
            }, (err, content) => {
                if (err) return cb(err);

                cb(err, data.Attributes, content && content.Body ? content.Body.toString() : '');
            });
        });
    },
};

function savePlayground(item, contents, cb) {
    item.file = `${item.id}~${item.version}.js`;

    dbClient.put({
        TableName: config.dbTableName,
        Item: item,
        // Checks if any item exists with the same PK (id+version) as what we are inserting, and
        // if it exists does it have an "id" attribute (which it must). So this check really says:
        // "Only insert if no item exists with the same id+version key."
        ConditionExpression: 'attribute_not_exists(id)',
    }, (err) => {
        if (err) return cb(err);

        s3Client.putObject({
            Bucket: config.s3BucketName,
            Key: item.file,
            Body: contents,
            CacheControl: 'max-age=31556926',
            ContentType: 'application/javascript',
        }, (err) => {
            cb(err, item, contents);
        });
    });
}

/**
 *
 * @param {string} id The ID of the playground.
 * @param {number} version The version of the playground.
 * @param {string} name The name of the new version.
 * @param {string} author The author of the new version.
 * @param {boolean} isPublic Is this playground public?
 * @param {boolean} isFeatured Is this playground featured?
 * @param {boolean} isOfficial Is this playground official?
 * @returns {object} The new item.
 */
function createItemData(id, version, name, author, isPublic, isFeatured, isOfficial) {
    const item = {
        id, version, name, author,
        created: Date.now(),
        starCount: 0,
        viewCount: 0,
        file: '',
    };

    // Only have the flag properties when they are true, so that only the items with
    // this attribute get put into the sparse indices for later querying. This has the
    // effect of creating 3 "lists" of items that are public, featured, or official.
    // It is still expensive to query these indices compared to hash-key lookups, but
    // is better than scanning the entire table.

    if (isPublic) {
        item.isPublic = 'x';
    }

    if (isFeatured) {
        item.isFeatured = 'x';
    }

    if (isOfficial) {
        item.isOfficial = 'x';
    }

    return item;
}

function getNextVersion(id, cb, LastEvaluatedKey) {
    let count = 0;

    const queryParams = {
        TableName: config.dbTableName,
        Select: 'COUNT',
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: { ':id': id },
    };

    // If set, this is a recursive call to get another page.
    if (LastEvaluatedKey) {
        queryParams.ExclusiveStartKey = LastEvaluatedKey;
    }

    dbClient.query(queryParams, (err, data) => {
        if (err) return cb(err);

        count += data.Count;

        // Query only returns the first 1MB of entries. Since our documents are small, it is
        // highly unlikely that any single hash key will contain > 1MB of version; however,
        // for robustness we will recurse until we have counted all the pages.
        if (data.LastEvaluatedKey) {
            getNextVersion(id, (err, version) => {
                if (err) return cb(err);

                count += version;
                cb(null, count);
            }, data.LastEvaluatedKey);
        }
        // normally we will go to this block, no more paging necessary.
        else {
            cb(null, count);
        }
    });
}
