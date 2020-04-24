import assert from 'assert';
import { createRequester, getClearConfig, parseLiList, testConfig, testConfigSecond } from './helper';
import StaticServer from '../src/fs_server';

let srv;
let requester;
let requesterSecond;

describe('Start/stop API', () => {
    let result;

    before(async () => {
        getClearConfig();
        requester = createRequester();
        srv = new StaticServer(testConfig);
    });

    after(async () => {
        await srv.stop(); //stopServer(result.server);
    });

    describe('Positive: server running tests:', () => {
        beforeEach(async () => {
            result = await srv.start();
        });

        afterEach(async () => {
            await srv.stop();
        });

        it('Server starting and response by HTTP', async () => {
            assert.equal(result, null);
            const res = await requester.get('/');

            assert.equal(res.status, 200);
        });

        it('Server stopping and not a response by HTTP', async () => {
            await srv.stop();

            await requester
                .get('/')
                .then(() => {
                    Promise.reject('Request should be rejected');
                })
                .catch(err => {
                    assert.equal(err.message, `connect ECONNREFUSED ${testConfig.host}:${testConfig.port}`);
                });
        }).timeout(5000);

        after(() => {
            requester.close();
        });
    });

    describe('Server stopping test', () => {
        beforeEach(async () => {
            result = await srv.start();
            result = await srv.stop(); //stopServer(resultStart.server);
        });

        // it('After the server stops, the returned parameters contain a link to the server.', async () => {
        //     assert.equal(result.server, resultStart.server);
        // });

        it('Stopping the server does not result in an error', async () => {
            assert.equal(result, null);
        });

        it('Stopping a stopped server results in an error', async () => {
            result = await srv.stop(); // stopServer(result.server);

            assert.equal(result.message, 'Server is not running.');
        });
    });

    describe('Negative server running tests:', () => {
        it('Don`t run Server if incorrect port', async () => {
            srv.port = 100500;
            result = await srv.start();

            assert.equal(result, 'Error: options.port should be >= 0 and < 65536. Received 100500.');
        });

        // it(`Don't stop Server without parameter`, async () => {
        //     const resultError = await srv.stop();
        //
        //     assert.equal(resultError.error.message, `Cannot read object 'server'`);
        // });

        const runs = [
            { it: null, options: `Cannot read object 'server'` },
            { it: 'foo', options: `Error: Server NOT stopped!` },
            { it: { foo: 'bar' }, options: `Error: Server NOT stopped!` }
        ];

        runs.forEach(run => {
            it(`Don't stop Server with unacceptable parameter: ${run.it}`, async () => {
                srv.server = run.it;
                const resultError = await srv.stop(); // stopServer(run.it);

                assert.equal(resultError.message, run.options);//`Error: Cannot read object 'server'`);
            });
        });
    });
});

describe(`Running two servers on different ports and with different paths`, () => {
    let result;

    before(async () => {
        getClearConfig();
        requester = createRequester();
        requesterSecond = createRequester(testConfigSecond.host, testConfigSecond.port);

        srv = { first: null, second: null };

        srv.first = new StaticServer(testConfig);
        srv.second = new StaticServer(testConfigSecond);
    });

    after(async () => {
        await srv.first.stop();
        await srv.second.stop();
    });

    it(`Started without errors`, async () => {
        result = await srv.first.start();
        assert.equal(result, null);

        result = await srv.second.start();
        assert.equal(result, null);
    });

    it(`Each server responds to a request`, async () => {
        const resFirst = await requester.get('/');
        const resSecond = await requesterSecond.get('/');

        assert.equal(resFirst.status, 200);
        assert.equal(resSecond.status, 200);
    });

    it(`The displayed lists of the subdirectory of one and the main directory of another are identical`, async () => {
        const resFirst = await requester.get('/elements');
        const resSecond = await requesterSecond.get('/');

        const docFirst = parseLiList(resFirst.text);
        const docSecond = parseLiList(resSecond.text);

        assert.equal(JSON.stringify(docFirst), JSON.stringify(docSecond));
    });

    it(`Restarting the second server on the same port`, async () => {
        result = await srv.second.stop();
        assert.equal(result, null, 'Server stopped without Error');

        result = await srv.second.start();
        assert.equal(result, null, 'Server Restarted without Error');
    });

    it(`Stopping one don't stop the other server`, async () => {
        result = await srv.second.stop();
        assert.equal(result, null, 'Server stopped without Error');

        result = await requester.get('/');
        assert.equal(result.status, 200);
    });
});
