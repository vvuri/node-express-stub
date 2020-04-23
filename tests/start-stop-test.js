import assert from 'assert';
import { createRequester, getClearConfig, testConfig, testConfigSecond } from './helper';
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
                    assert.equal(err.message, `connect ECONNREFUSED ${testConfig.HOST}:${testConfig.PORT}`);
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

    describe.only(`Запуск двух серверов на разных портах и с разными путями`, () => {
        before(async () => {
            getClearConfig();
            requester = createRequester();
            requesterSecond = createRequester(testConfigSecond.HOST, testConfigSecond.PORT);

            srv = { first: null, second: null };

            srv.first = new StaticServer(testConfig);
            srv.second = new StaticServer(testConfigSecond);
        });

        after(async () => {
            await srv.first.stop();
            await srv.second.stop();
        });

        it(`запустились без ошибок`, () => {
            assert.equal(srv.first, null);
            assert.equal(srv.second, null);
        });

        it(`отвечает на запрос 1 и 2`, async () => {
            const resFirst = await requester.get('/');
            const resSecond = await requesterSecond.get('/');

            assert.equal(resFirst.status, 200);
            assert.equal(resSecond.status, 200);
        });

        it(`подкаталог одного и основной каталог дурго выдаю список одних и тех же файлов`, () => {

        });

        it(`остановка одного не приводи к остановке другого`, () => {

        });

        it(`можно перезапустить сервер на том же порту`, () => {

        });

        it(`mock hostname`, async () => {

        });

    });
});
