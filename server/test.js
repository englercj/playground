'use strict';

/* eslint-disable consistent-return */

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-2' });

// create clients
const dbClient = new AWS.DynamoDB.DocumentClient();

dbClient.update({
    TableName: 'pixi-playground-test',
    Key: { id: '9bb1ee8681d495c78a866344ca12c42f' },
    UpdateExpression: 'set viewCount = viewCount + :val',
    ExpressionAttributeValues: { ':val': 1 },
    ReturnValues: 'ALL_NEW',
}, (err, data) => {
    console.log('INC', err, data && data.Attributes);
});

dbClient.get({
    TableName: 'pixi-playground-test',
    Key: { id: '9bb1ee8681d495c78a866344ca12c42f' },
}, (err, data) => {
    console.log('GET', err, data && data.Item);
});
