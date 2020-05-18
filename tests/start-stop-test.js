import assert from 'assert';
import { createRequester, getClearConfig, parseLiList, stopSrv, testConfig } from './helper';
import fs from 'fs';
import proxyquire from 'proxyquire';
import StaticServer from '../src/fs_server';

let srv;
let requester;

proxyquire.noPreserveCache();

describe('Start/stop API', () => {
    before(async () => {
        getClearConfig();
        requester = createRequester();
        srv = new StaticServer(testConfig);
    });

    describe('Negative: server running tests:', () => {
        it('Error when deleted dir after start server', async () => {
            const newdir = testConfig.rootDir.concat('/elements/newdir');

            fs.mkdirSync(newdir, '0744');
            await srv.start();
            fs.rmdirSync(newdir, { recursive: true });

            const res = await requester.get('/elementas/newdir');

            assert.equal(res.status, 404);
            assert.equal(srv.isRunning, true);
            await stopSrv(srv);
        });
    });

    describe('Positive: server running tests:', () => {
        beforeEach(async () => {
            await srv.start();
        });

        afterEach(async () => {
            await stopSrv(srv);
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
            await srv.stop();
            assert.equal(srv.isRunning, false);
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
                await stopSrv(srv);
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

        it('Return error message in statDir() if we can not read information about a file', async () => {
            const { statDir } = proxyquire('../dist/fs_helper', { 'fs': { stat: () => {
                throw new Error('Run mock statDir()');
            } } });
            const error = await statDir(testConfig.rootDir);

            assert(error.message, 'Error getting information about a file:public: Run mock statDir()');
        });

        it('Interrupt execution if directory tree traversal error', async () => {
            const fakeStarDir = file => {
                throw new Error(`Mock error ${file}`);
            };

            try {
                const { getListSubDirectories } = proxyquire('../dist/fs_helper', { 'fs': { stat: { isDirectory: fakeStarDir } } });

                await getListSubDirectories(testConfig.rootDir);
            }
            catch (err) {
                assert(err, `Cannot read property 'isDirectory' of undefined`);
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
        after(async () => {
            await stopSrv(srv.first);
            await stopSrv(srv.second);
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

        afterEach(async () => {
            await stopSrv(srv.first);
            await stopSrv(srv.second);
        });

        it(`Stopping one don't stop the other server`, async () => {
            await srv.second.stop();
            assert.equal(srv.second.isRunning, false);
            const result = await requester.get('/');

            assert.equal(result.status, 200);
        });

        it(`Restarting the second server on the same port`, async () => {
            await srv.second.stop();
            await srv.second.start();
            assert.equal(srv.second.isRunning, true);
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

    after(async () => {
        await stopSrv(srv.first);
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
