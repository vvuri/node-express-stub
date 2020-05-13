import assert from 'assert';
import { createRequester, getClearConfig, parseLiList, stopSrv, testConfig } from './helper';
import StaticServer from '../src/fs_server';

let srv;
let requester;

describe('Start/stop API', () => {
    before(async () => {
        getClearConfig();
        requester = createRequester();
        srv = new StaticServer(testConfig);
    });

    describe('Positive: server running tests:', () => {
        beforeEach(async () => {
            await srv.start();
        });

        afterEach(async () => {
            stopSrv(srv);
        });

        it('Server starting and response by HTTP', async () => {
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
            await srv.start();
        });

        it('Stopping the server does not result in an error', async () => {
            await assert.doesNotReject(
                async () => {
                    await srv.stop();
                },
                SyntaxError
            );
        });

        it('Stopping a stopped server results in an error', async () => {
            await srv.stop();
            await assert.rejects(
                async () => await srv.stop(),
                {
                    name:    'Error',
                    message: 'Server is not running.'
                });
        });
    });

    describe('Negative server running tests:', () => {
        it('Don`t run Server if incorrect port', async () => {
            srv.port = 100500;
            try {
                await srv.start();
            }
            catch (error) {
                assert.equal(error, 'Error: options.port should be >= 0 and < 65536. Received 100500.');
            }
            finally {
                stopSrv(srv);
            }
        });

        it('Don`t run Server on nonexistent directory', async () => {
            srv.rootDir = 'private';
            try {
                await srv.start();
            }
            catch (error) {
                assert.equal(error.substr(0, 33), 'ENOENT: no such file or directory');
            }
        });
    });
});

describe(`Running two servers on different ports and with different paths`, () => {
    let requesterSecond;

    before(async () => {
        const testConfigSecond = { host: testConfig.host, port: '9999', rootDir: 'public/elements' };

        getClearConfig();
        requester = createRequester();
        requesterSecond = createRequester(testConfigSecond.host, testConfigSecond.port);

        srv = {
            first:  new StaticServer(testConfig),
            second: new StaticServer(testConfigSecond)
        };
    });

    describe(`Started two servers without errors`, () => {
        after( () => {
            stopSrv(srv.first);
            stopSrv(srv.second);
        });

        it(`Started without errors`, async () => {
            await srv.first.start();
            assert.equal(srv.first.isRunning, true);

            await srv.second.start();
            assert.equal(srv.second.isRunning, true);
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
    });

    describe(`Stopping one of servers`, () => {
        beforeEach(`Started without errors`, async () => {
            await srv.first.start();
            await srv.second.start();
        });

        afterEach( () => {
            stopSrv(srv.first);
            stopSrv(srv.second);
        });

        it(`Stopping one don't stop the other server`, async () => {
            await assert.doesNotReject(
                async () => {
                    await srv.second.stop();
                },
                SyntaxError
            );

            const result = await requester.get('/');

            assert.equal(result.status, 200);
        });

        it(`Restarting the second server on the same port`, async () => {
            await srv.second.stop();
            await assert.doesNotReject(
                async () => {
                    await srv.second.start();
                },
                SyntaxError
            );
        });
    });
});

describe('Negative two server running tests:', () => {
    before(async () => {
        srv = {
            first:  new StaticServer(testConfig),
            second: new StaticServer(testConfig)
        };
        await srv.first.start();
    });

    after( () => {
        stopSrv(srv.first);
    });

    it('Don`t run second Server on the same port', async () => {
        try {
            await srv.second.start();
        }
        catch (error) {
            assert.equal(error, `Error: listen EADDRINUSE: address already in use :::${testConfig.port}`);
        }
    });
});
