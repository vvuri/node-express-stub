import assert from 'assert';
import { createRequester, getClearConfig, testConfig } from './helper';

let requester;
let startServer;
let stopServer;

describe('Start/stop API', () => {
    before(async () => {
        getClearConfig();

        requester = createRequester();

        const utils = require('../dist/fs_server');

        startServer = utils.startServer;
        stopServer  = utils.stopServer;
    });

    describe('Positive: server running tests:', () => {
        let result;

        beforeEach(async () => {
            result = await startServer();
        });

        afterEach(async () => {
            await stopServer(result.server);
        });

        it('Server starting and response by HTTP', async () => {
            assert.equal(result.error, null);
            const res = await requester.get('/');

            assert.equal(res.status, 200);
        });

        it('Server stopping and not a response by HTTP', async () => {
            await stopServer(result.server);

            await requester
                .get('/')
                .then(() => {
                    Promise.reject('Request should be rejected');
                })
                .catch(err => {
                    assert.equal(err.message, `connect ECONNREFUSED ${testConfig.HOST}:${testConfig.PORT}`);
                });
        });

        after(() => {
            requester.close();
        });
    });

    describe('Negative server running tests:', () => {
        it('Don`t run Server if incorrect port', async () => {
            const result = await startServer(100500);

            assert.equal(result.server, null);
            assert.equal(result.error, 'options.port should be >= 0 and < 65536. Received 100500.');
        });

        it(`Don't stop Server without parameter`, async () => {
            const resultError = await stopServer();

            assert.equal(resultError.error.message, `Cannot read object 'server'`);
        });

        const runs = [
            { it: null, options: '' },
            { it: 'foo', options: '' },
            { it: { foo: 'bar' }, options: '' }
        ];

        runs.forEach(run => {
            it(`Don't stop Server with unacceptable parameter: ${run.it}`, async () => {
                const resultError = await stopServer([run.it]);

                assert.equal(resultError.error.message, `Error: Server NOT stopped!`);
            });
        });
    });
});

