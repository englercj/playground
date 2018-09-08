import * as CODES from 'http-codes';
import { suite, test } from 'mocha-typescript';
import { request } from '../../fixtures/server';

@suite('Read Routes')
class ReadRoutes
{
    @test 'GET health API should return 200'()
    {
        return request.get('/api/health')
            .expect(CODES.OK);
    }
}
