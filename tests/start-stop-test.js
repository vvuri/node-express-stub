import chai from 'chai';
import chaiHttp from 'chai-http';
import assert from 'assert';
import { startServer, stopServer } from '../dist/fs_server';

chai.use(chaiHttp);

describe('Positive: server running tests:', () => {
    let requester;
    let result;

    before( () => {
        delete process.env.PORT;
        delete process.env.HOST;
        delete process.env.ROOT_DIR;
        const config = require('../dist/fs_config');
        const url = `http://${config.HOST}:${config.PORT}`;

        requester = chai.request(url).keepOpen();
    });

    beforeEach( async () => {
        result = await startServer();
    });

    afterEach( async () => {
        await stopServer(result.server);
    });

    it('Server starting and response by HTTP', async () => {
        assert.equal(result.error, null);
        const res = await requester.get('/');

        assert.equal(res.status, 200);
    });

    it('Server stopping and not a response by HTTP', async () => {
        await stopServer(result.server);
        let res;

        try {
            res = await requester.get('/');
        }
        catch (e) {
            //
        }
        assert.equal(result.error, null);
        assert.equal(typeof res, 'undefined', 'Server not stoped');
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

    it('Don`t stop Servers without parameter', async () => {
        const result = await startServer();

        assert.equal(result.error, null);

        try {
            const resultError = await stopServer();

            assert.equal(resultError.message, `Cannot read property 'server' of undefined`);
        }
        catch (e) {
            //
        }
        finally {
            await stopServer(result.server);
        }
    });
});
