import chai from 'chai';
import chaiHttp from 'chai-http';
import assert from 'assert';
import { startServer, stopServer } from '../dist/fs_server';

chai.use(chaiHttp);

describe('Positive: server running tests:', () => {
    let requester;

    before( () => {
        const config = require('../dist/fs_config');
        const url = `http://${config.HOST}:${config.PORT}`;

        requester = chai.request(url).keepOpen();
    });

    it('Server starting and response by HTTP', async () => {
        const [ error, server ] = await startServer();

        assert.equal(error, null);
        const res = await requester.get('/');

        assert.equal(res.status, 200);
        await stopServer(server);
    });

    it('Server stopping and not a response by HTTP', async () => {
        const [ error, server ] = await startServer();

        await stopServer(server);
        let res;

        try {
            res = await requester.get('/');
        }
        catch (e) {
            //
        }
        assert.equal(error, null);
        assert.equal(typeof res, 'undefined', 'Server not stoped');
    });

    after(() => {
        requester.close();
    });
});

describe('Negative server running tests:', () => {

    it('Don`t run Server if incorrect port', async () => {
        const [ error, server ] = await startServer(100500);

        assert.equal(server, null);
        assert.equal(error, 'options.port should be >= 0 and < 65536. Received 100500.');
    });

    it('Don`t stop Servers without parameter', async () => {
        const [ error, server ] = await startServer();

        assert.equal(error, null);

        try {
            const result = await stopServer();

            assert.equal(result.message, `Cannot read property 'server' of undefined`);
        }
        catch (e) {
            //console.log(`>> ${e.message}`);
        }
        finally {
            await stopServer(server);
        }
    });
});
