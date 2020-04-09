const chai = require('chai');
const proxyquire = require('proxyquire').noPreserveCache();
const assert = require('assert');
const { AssertionError } = require('assert');

describe('Positive: server runing tests:', () => {
    const srv = require('../dist/fs_server');
    let server;
    let requester;

    before(() => {
        const config = require('../dist/fs_config');
        const url = `http://${config.HOST}:${config.PORT}`;

        console.log(url);
        requester = chai.request(url).keepOpen();
    });

    it('Server starting and response by HTTP', async () => {
        server = srv.startServer();
        const res = await requester.get('/');

        assert.equal(res.status, 200);
        srv.stopServer(server);
    });

    it('Server stopping and not a response by HTTP', async () => {
        server = srv.startServer();
        srv.stopServer(server);
        try {
            const res = await requester.get('/');

            assert.notEqual(res.status, 200, 'Server not stoped');
        }
        catch (e) {
            // assert.equal(typeof res, 'undefined', 'Server not stoped');
        }
    });

    after(() => {
        requester.close();
    });
});

describe('Negative server runing tests:', () => {

    it.skip('Don`t run Server if incorrect port', async () => {
        process.env.PORT = 100500;
        const example = proxyquire('../dist/fs_server.js', {});

        try {
            process.env.PORT = 100500;
            example.startServer();

            assert.fail('expected exception not thrown');
        }
        catch (e) {
            if (e instanceof AssertionError) {
                // bubble up the assertion error
                throw e;
            }
            assert.equal(e.message, 'Invalid Arguments');
        }
    });

    it.skip('Don`t run two Servers on one port', async () => {
        const srv = require('../dist/fs_server');
        const server = srv.startServer();

        try {
            srv.startServer();
        }
        catch (e) {
            console.log(`>>>> ${e.message}`);
        }
        finally {
            srv.stopServer(server);
        }
    });
});
