const srv = require('../dist/fs_server');

describe('Positive tests:', () => {
    let server;

    it('Start one server', async () => {
        server = srv.startServer();

    });

    it('Stop one server', async () => {
        setTimeout(() => {
            srv.stopServer(server);
        }, 1000);
    });
});
