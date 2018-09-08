import * as CODES from 'http-codes';
import * as supertest from 'supertest';
import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { request, clearDb } from '../../fixtures/server';
import { Playground } from '../../../src/models/Playground';
import { IPlayground } from '../../../../shared/types';

const testPlaygroundData: IPlayground = {
    slug: 'hN4tERudnG0mMDZrafh7U',
    name: 'test',
    description: undefined,
    contents: 'STUFF!',
    author: 'Chad Engler',
    pixiVersion: 'v5.0.0',
    isPublic: undefined,
    externalJs: [],
    tags: [],
};

function createPlayground()
{
    return (new Playground(testPlaygroundData as any)).save();
}

@suite('Read Routes')
class ReadRoutes
{
    static before()
    {
        return clearDb().then(() => createPlayground());
    }

    @test 'GET search should return 1 result'()
    {
        return request.get(`/api/playgrounds?q=test`)
            .expect(CODES.OK)
            .expect((res: supertest.Response) =>
            {
                expect(res.body).to.be.an('array').with.length(1);
                checkPlaygroundData(res.body[0]);
            });
    }

    @test 'GET without version should return version 0'()
    {
        return request.get(`/api/playground/${testPlaygroundData.slug}`)
            .expect(CODES.OK)
            .expect(confirmPlaygroundResponse());
    }

    // @test 'GET with version should return proper data'()
    // {
    //     return request.get(`/api/playground/${testPlaygroundData.slug}/0`)
    //         .expect(CODES.OK)
    //         .expect(confirmPlaygroundData());
    // }
}

@suite('Read Route Errors')
class ReadRouteErrors
{
    static before()
    {
        return clearDb();
    }

    @test 'GET search with no results should return 404'()
    {
        return request.get('/api/playgrounds?q=nope')
            .expect(CODES.NOT_FOUND);
    }

    @test 'GET empty search query should return 422'()
    {
        return request.get('/api/playgrounds?q=nope')
            .expect(CODES.NOT_FOUND);
    }

    @test 'GET non-existant slug should return 404'()
    {
        return request.get('/api/playground/nope')
            .expect(CODES.NOT_FOUND);
    }

    // @test 'GET invalid version should return 422'()
    // {
    //     return request.get(`/api/playground/${testPlaygroundData.slug}/nope`)
    //         .expect(CODES.UNPROCESSABLE_ENTITY);
    // }

    // @test 'GET non-existant version should return 404'()
    // {
    //     return request.get(`/api/playground/${testPlaygroundData.slug}/100`)
    //         .expect(CODES.NOT_FOUND);
    // }

    // @test 'GET non-existant slug/version should return 404'()
    // {
    //     return request.get(`/api/playground/nope/100`)
    //         .expect(CODES.NOT_FOUND);
    // }
}

@suite('Write Routes')
class WriteRoutes
{
    static before()
    {
        return clearDb().then(() => createPlayground());
    }

    @test 'POST creates a new playground'()
    {
        return request.post('/api/playground')
            .send(testPlaygroundData)
            .expect(CODES.CREATED)
            .expect(confirmPlaygroundResponse(null))
            .then((res) =>
            {
                const item = res.body;

                expect(item)
                    .to.have.property('externalJs')
                    .that.is.an('array')
                    .with.length(0);

                // return request.get(`/api/playground/${item.slug}/${item.version}`)
                return request.get(`/api/playground/${item.slug}`)
                    .expect(CODES.OK)
                    .expect(confirmPlaygroundResponse(null));
            });
    }

    @test 'POST creates a new playground with externalJs'()
    {
        const externalJs = ['https://test.com/file.js'];
        const data = { ...testPlaygroundData };
        data.externalJs = externalJs;

        return request.post('/api/playground')
            .send(data)
            .expect(CODES.CREATED)
            .expect(confirmPlaygroundResponse(null))
            .then((res) =>
            {
                const item = res.body;

                expect(item)
                    .to.have.property('externalJs')
                    .that.is.an('array')
                    .and.eql(externalJs);

                // return request.get(`/api/playground/${item.slug}/${item.version}`)
                return request.get(`/api/playground/${item.slug}`)
                    .expect(CODES.OK)
                    .expect(confirmPlaygroundResponse(null));
            });
    }

    // @test 'POST with slug creates a new playground version'()
    // {
    //     return request.post(`/api/playground/${testPlaygroundData.slug}`)
    //         .send({ ...testPlaygroundData })
    //         .expect(CODES.OK)
    //         .expect(confirmPlaygroundData(testPlaygroundData.slug, 1))
    //         .then((res) =>
    //         {
    //             const item = res.body;

    //             return request.get(`/api/${item.slug}/${item.version}`)
    //                 .expect(CODES.OK)
    //                 .expect(confirmPlaygroundData(testPlaygroundData.slug, 1));
    //         });
    // }
}

@suite('Write Route Errors')
class WriteRouteErrors
{
    static before()
    {
        return clearDb().then(() => createPlayground());
    }

    @test 'POST without contents returns 422'()
    {
        const data = { ...testPlaygroundData };
        data.contents = '';

        return request.post('/api/playground')
            .send(data)
            .expect(CODES.UNPROCESSABLE_ENTITY);
    }

    // @test 'POST with slug, and without contents returns 422'()
    // {
    //     return request.post('/api/playground/nope')
    //         .send(testPlaygroundData)
    //         .expect(CODES.UNPROCESSABLE_ENTITY);
    // }
}

function confirmPlaygroundResponse(slug: string = testPlaygroundData.slug, version: number = 0)
{
    return (res: supertest.Response) =>
    {
        checkPlaygroundData(res.body);
    };
}

function checkPlaygroundData(item: IPlayground, slug: string = item.slug, version: number = (item.versionsCount || 0))
{
    expect(item).to.have.property('id').that.is.a('number');
    expect(item).to.have.property('slug', slug);
    expect(item).to.have.property('name', testPlaygroundData.name);
    expect(item).to.have.property('contents', testPlaygroundData.contents);
    expect(item).to.have.property('author', testPlaygroundData.author);
    expect(item).to.have.property('versionsCount', version);
    expect(item).to.have.property('starCount', 0);
    expect(item).to.have.property('pixiVersion', testPlaygroundData.pixiVersion);
    expect(item).to.have.property('isPublic', true);
    expect(item).to.have.property('isFeatured', false);
    expect(item).to.have.property('isOfficial', false);
    expect(item).to.have.property('createdAt').that.is.a('string');
    expect(item).to.have.property('updatedAt').that.is.a('string');

    expect(item).to.have.property('externalJs').that.is.an('array');

    if (item.hasOwnProperty('description'))
        expect(item).to.have.property('description', null);

    if (item.hasOwnProperty('tags'))
        expect(item).to.have.property('tags').that.is.an('array').with.length(0);
}
