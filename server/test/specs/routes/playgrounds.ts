import * as CODES from 'http-codes';
import * as supertest from 'supertest';
import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import { request, clearDb } from '../../fixtures/server';
import { Playground } from '../../../src/models/Playground';
import { Tag } from '../../../src/models/Tag';
import { IPlayground, ITag, IExternalJs } from '../../../../shared/types';

const testPlaygroundData: IPlayground = {
    slug: 'hN4tERudnG0mMDZrafh7U',
    name: 'test',
    description: undefined,
    contents: 'STUFF!',
    author: 'Chad Engler',
    pixiVersion: 'v5.0.0',
    isPublic: undefined,
    externaljs: [],
    tags: [],
};

function createPlayground()
{
    return (new Playground(testPlaygroundData as any)).save();
}

@suite('/api/playgrounds')
class PlaygroundsSearch
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
                checkPlaygroundExtras(res.body[0], testPlaygroundData.slug, null, null);
            });
    }

    @test 'GET search with no results should return 404'()
    {
        return request.get('/api/playgrounds?q=nope')
            .expect(CODES.NOT_FOUND);
    }

    @test 'GET empty search query should return 422'()
    {
        return request.get('/api/playgrounds?q=')
            .expect(CODES.UNPROCESSABLE_ENTITY);
    }
}

@suite('/api/playground')
class PlaygroundRoot
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
                    .to.have.property('externaljs')
                    .that.is.an('array')
                    .with.length(0);

                // return request.get(`/api/playground/${item.slug}/${item.version}`)
                return request.get(`/api/playground/${item.slug}`)
                    .expect(CODES.OK)
                    .expect(confirmPlaygroundResponse(item.slug));
            });
    }

    @test 'POST creates a new playground with externaljs'()
    {
        const externaljs = [{ url: 'https://test.com/file.js' }];
        const data = { ...testPlaygroundData };
        data.externaljs = externaljs;

        return request.post('/api/playground')
            .send(data)
            .expect(CODES.CREATED)
            .expect(confirmPlaygroundResponse(null, null, externaljs));
    }

    @test 'POST without contents returns 422'()
    {
        const data = { ...testPlaygroundData };
        data.contents = '';

        return request.post('/api/playground')
            .send(data)
            .expect(CODES.UNPROCESSABLE_ENTITY);
    }

    @test 'POST with tags should create associations'()
    {
        const tag1 = new Tag({ name: 'tag1' });
        const tag2 = new Tag({ name: 'tag2' });

        let tagModels: Tag[] = [];

        return Promise.all([
            tag1.save(),
            tag2.save()
        ])
        .then((tags) =>
        {
            tagModels = tags;

            const data = { ...testPlaygroundData };
            data.tags = [{ id: tags[0].id }, { id: tags[1].id }];

            return request.post('/api/playground')
                .send(data)
                .expect(CODES.CREATED)
                .expect(confirmPlaygroundResponse(
                    null,
                    [
                        { id: tagModels[0].id, name: tagModels[0].name },
                        { id: tagModels[1].id, name: tagModels[1].name },
                    ]));
        })
        .then((res1) =>
        {
            return request.get(`/api/playground/${res1.body.slug}`)
                .expect(CODES.OK)
                .expect(confirmPlaygroundResponse(
                    null,
                    [
                        { id: tagModels[0].id, name: tagModels[0].name },
                        { id: tagModels[1].id, name: tagModels[1].name },
                    ]));
        });
    }
}

@suite('/api/playground/:slug')
class PlaygroundSlug
{
    static before()
    {
        return clearDb().then(() => createPlayground());
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

    @test 'PUT updates a playground'()
    {
        const name = 'new-name';
        const data = { id: 1, ...testPlaygroundData };
        data.name = name;

        return request.put(`/api/playground/${data.slug}`)
            .send(data)
            .expect(CODES.OK)
            .expect((res: supertest.Response) =>
            {
                expect(res.body).to.have.property('name', name);
            });
    }

    @test 'PUT without contents returns 422'()
    {
        const data = { id: 1, ...testPlaygroundData };
        data.contents = '';

        return request.put(`/api/playground/${testPlaygroundData.slug}`)
            .send(data)
            .expect(CODES.UNPROCESSABLE_ENTITY);
    }

    @test 'PUT without id returns 404'()
    {
        const data = { ...testPlaygroundData };

        return request.put(`/api/playground/${testPlaygroundData.slug}`)
            .send(data)
            .expect(CODES.NOT_FOUND);
    }

    @test 'PUT with tags should create associations'()
    {
        const tag1 = new Tag({ name: 'tag1' });
        const tag2 = new Tag({ name: 'tag2' });

        let tagModels: Tag[] = [];

        return Promise.all([
            tag1.save(),
            tag2.save()
        ])
        .then((tags) =>
        {
            tagModels = tags;

            const data = { id: 1, ...testPlaygroundData };
            data.tags = [{ id: tags[0].id }, { id: tags[1].id }];

            return request.put(`/api/playground/${testPlaygroundData.slug}`)
                .send(data)
                .expect(CODES.OK);
        })
        .then(() =>
        {
            return request.get(`/api/playground/${testPlaygroundData.slug}`)
                .expect(CODES.OK)
                .expect((res: supertest.Response) =>
                {
                    const item = res.body;

                    expect(item)
                        .to.have.property('tags')
                        .with.length(2);

                        expect(item.tags[0]).to.have.property('id', tagModels[0].id);
                        expect(item.tags[0]).to.have.property('name', tagModels[0].name);
                        expect(item.tags[1]).to.have.property('id', tagModels[1].id);
                        expect(item.tags[1]).to.have.property('name', tagModels[1].name);
                });
        });
    }

    @test 'PUT with different tags should create associations'()
    {
        const tag1 = new Tag({ name: 'tag1' });
        const tag2 = new Tag({ name: 'tag2' });

        let tagModels: Tag[] = [];

        return Promise.all([
            tag1.save(),
            tag2.save()
        ])
        .then((tags) =>
        {
            tagModels = tags;

            const data = { id: 1, ...testPlaygroundData };
            data.tags = [{ id: tags[0].id }, { id: tags[1].id }];

            return request.put(`/api/playground/${testPlaygroundData.slug}`)
                .send(data)
                .expect(CODES.OK);
        })
        .then(() =>
        {
            return request.get(`/api/playground/${testPlaygroundData.slug}`)
                .expect(CODES.OK)
                .expect((res: supertest.Response) =>
                {
                    const item = res.body;

                    expect(item)
                        .to.have.property('tags')
                        .with.length(2);

                        expect(item.tags[0]).to.have.property('id', tagModels[0].id);
                        expect(item.tags[0]).to.have.property('name', tagModels[0].name);
                        expect(item.tags[1]).to.have.property('id', tagModels[1].id);
                        expect(item.tags[1]).to.have.property('name', tagModels[1].name);
                });
        });
    }
}

function confirmPlaygroundResponse(slug: string = testPlaygroundData.slug, tags: ITag[] = null, externaljs: IExternalJs[] = [])
{
    return (res: supertest.Response) =>
    {
        checkPlaygroundData(res.body);
        checkPlaygroundExtras(res.body, slug, tags, externaljs);
    };
}

function checkPlaygroundData(item: IPlayground)
{
    expect(item).to.have.property('id').that.is.a('number');
    expect(item).to.have.property('name', testPlaygroundData.name);
    expect(item).to.have.property('description', null);
    expect(item).to.have.property('contents', testPlaygroundData.contents);
    expect(item).to.have.property('author', testPlaygroundData.author);
    expect(item).to.have.property('versionsCount', 1);
    expect(item).to.have.property('starCount', 0);
    expect(item).to.have.property('pixiVersion', testPlaygroundData.pixiVersion);
    expect(item).to.have.property('isPublic', true);
    expect(item).to.have.property('isFeatured', false);
    expect(item).to.have.property('isOfficial', false);
    expect(item).to.have.property('createdAt').that.is.a('string');
    expect(item).to.have.property('updatedAt').that.is.a('string');
}

function checkPlaygroundExtras(item: IPlayground, slug: string, tags: ITag[], externaljs: IExternalJs[])
{
    if (slug)
        expect(item).to.have.property('slug', slug);

    if (tags)
    {
        expect(item).to.have.property('tags').with.length(tags.length);

        for (let i = 0; i < tags.length; ++i)
        {
            expect(item.tags[i]).to.have.property('id', tags[i].id);
            expect(item.tags[i]).to.have.property('name', tags[i].name);
        }

    }

    if (externaljs)
    {
        expect(item).to.have.property('externaljs').with.length(externaljs.length);

        for (let i = 0; i < externaljs.length; ++i)
        {
            expect(item.externaljs[i]).to.have.property('url', externaljs[i]);
        }
    }
}
