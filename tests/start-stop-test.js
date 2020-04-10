const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');

chai.use(chaiHttp);

describe('Positive: server runing tests:', () => {
    const srv = require('../dist/fs_server');
    let requester;

    before( () => {
        const config = require('../dist/fs_config');
        const url = `http://${config.HOST}:${config.PORT}`;

        requester = chai.request(url).keepOpen();
    });

    it('Server starting and response by HTTP', async () => {
        const server = await srv.startServer();
        const res = await requester.get('/');

        assert.equal(res.status, 200);
        await srv.stopServer(server);
    });

    it('Server stopping and not a response by HTTP', async () => {
        const server = await srv.startServer();

        await srv.stopServer(server);
        let res;

        try {
            res = await requester.get('/');
        }
        catch (e) {
            //
        }
        assert.equal(typeof res, 'undefined', 'Server not stoped');
    });

    after(() => {
        requester.close();
    });
});

describe('Negative server runing tests:', () => {

    it('Don`t run Server if incorrect port', async () => {
        const srv = require('../dist/fs_server.js');

        const result = await srv.startServer(100500);

        assert.equal(result, 'options.port should be >= 0 and < 65536. Received 100500.');
    });

    it('Don`t stop Servers without parameter', async () => {
        const srv = require('../dist/fs_server');
        const server = await srv.startServer();

        try {
            const result = await srv.stopServer();

            assert.equal(result.message, `Cannot read property 'server' of undefined`);
        }
        catch (e) {
            //console.log(`>> ${e.message}`);
        }
        finally {
            await srv.stopServer(server);
        }
    });
});
