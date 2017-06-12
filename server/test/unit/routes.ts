import * as CODES from 'http-codes';
import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { request, clearDb } from '../fixtures/server';
import { createPlayground, getFilename } from '../../src/lib/data';
import * as supertest from 'supertest';

const testPlaygroundData: IPlaygroundData = {
    name: 'test',
    pixiVersion: 'v5.0.0',
};

const testPlaygroundContents = 'STUFF!';

@suite
class Routes {
    static before() {
        return createPlayground(testPlaygroundData, testPlaygroundContents);
    }

    @test('Health API')
    health() {
        return request.get('/api/health')
            .expect(CODES.OK);
    }

    @test('Get (no version)')
    getId() {
        return request.get('/api/1')
            .expect(CODES.OK)
            .expect(confirmDefaultPlayground);
    }

    @test('Get (with version)')
    getIdVersion() {
        return request.get('/api/1/0')
            .expect(CODES.OK)
            .expect(confirmDefaultPlayground);
    }
}

function confirmDefaultPlayground(res: supertest.Response) {
    expect(res.body).to.have.property('item').that.is.an('object');
    expect(res.body).to.have.property('contents', testPlaygroundContents);

    const item = res.body.item;

    expect(item).to.have.property('id', 1);
    expect(item).to.have.property('version', 0);
    expect(item).to.have.property('name', testPlaygroundData.name);
    expect(item).to.have.property('file', getFilename(testPlaygroundContents));
    expect(item).to.have.property('author', null);
    expect(item).to.have.property('starCount', 0);
    expect(item).to.have.property('pixiVersion', testPlaygroundData.pixiVersion);
    expect(item).to.have.property('isPublic', true);
    expect(item).to.have.property('isFeatured', false);
    expect(item).to.have.property('isOfficial', false);
    expect(item).to.have.property('createdAt').that.is.a('string');
    expect(item).to.have.property('updatedAt').that.is.a('string');
}
