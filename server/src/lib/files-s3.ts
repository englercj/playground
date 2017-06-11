import * as AWS from 'aws-sdk';
import * as config from '../config';
import * as Promise from 'bluebird';

// TODO: Should I refactor this to not create AWS stuff at all unless it is used? Not sure if it is important.
AWS.config.update({ region: config.region });

const s3Client = new AWS.S3();

export function loadFile(filename: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        s3Client.getObject({
            Bucket: config.s3BucketName,
            Key: filename,
        }, (err, content) => {
            if (err) reject(err);
            else resolve(content && content.Body ? content.Body.toString() : '');
        });
    });
}

export function saveFile(filename: string, contents: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        s3Client.putObject({
            Bucket: config.s3BucketName,
            Key: filename,
            Body: contents,
            CacheControl: 'max-age=31556926',
            ContentType: 'application/javascript',
        }, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
