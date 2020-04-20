import decache from 'decache';
import { getClearConfig } from './helper';

describe('Positive: server running tests:', () => {
    let result;
    let startServer;
    let stopServer;

    before( async () => {
        decache('../dist/fs_config.js');
        getClearConfig();
        startServer = require('../dist/fs_server').startServer;
        stopServer  = require('../dist/fs_server').stopServer;
    });

    it('test', async () => {
        console.log('Begin');
        result = await startServer();
        console.log(`Start ${result}`);
        result = await stopServer(result.server);
        console.log(`Stop1 ${result}`);
        result = await stopServer(result.server);
        console.log(`Stop2 ${result}`);
        console.log('End');
    });
});
