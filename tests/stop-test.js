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

    it.only('test', async () => {
        console.log('Begin');
        result = await startServer();
        console.log(`Start ${result}`);
        result = await stopServer(result.server);
        console.log(`Stop1 ${JSON.stringify(result)}`);
        result = await stopServer(result.server);
        console.log(`Stop2 ${JSON.stringify(result)}`);
        console.log(`Error: ${JSON.stringify(result.error.message)}`);
        result = await stopServer(result.error);
        console.log(`Stop3 ${JSON.stringify(result)}`);
        console.log(`Error: ${JSON.stringify(result.error.message)}`);
        console.log('End');
    });
});
