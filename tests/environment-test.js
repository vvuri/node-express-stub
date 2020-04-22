import chai from 'chai';
import proxyquire from 'proxyquire';
import StaticServer from '../dist/fs_server';

proxyquire.noPreserveCache();
proxyquire.noCallThru();
const assert = chai.assert;

describe('Parameters passed to the class are more priority than env and file:', () => {
    const runs = [
        { it: 'Port', srv: 'port', option: '3333' },
        { it: 'Host', srv: 'host', option: '192.168.0.1' },
        { it: 'RootDir', srv: 'rootDir', option: 'public333' }
    ];

    runs.forEach( run => {
        it(`Positive: ${ run.it } should be set by ${ run.option }`, async () => {
            process.env[run.it] = run.option;
            const srv = new StaticServer({ [run.srv]: run.option });

            assert.equal(srv[run.srv], run.option);
        });
    });
});

describe('Environment variable should be set, if it is specified:', () => {
    const runs = [
        { it: 'PORT', srv: 'port', option: '5555' },
        { it: 'HOST', srv: 'host', option: '172.0.0.1' },
        { it: 'ROOT_DIR', srv: 'rootDir', option: 'public555' }
    ];

    runs.forEach( run => {
        it(`Positive: Should be set by process.env.${ run.it } = ${ run.option }`, async () => {
            process.env[run.it] = run.option;
            const srv = new StaticServer({});

            assert.equal(srv[run.srv], run.option);
        });
    });
});

describe('Load from file when environment undefined:', () => {
    const config = {
        'hostname': '127.4.4.4',
        'port':     '4444',
        'dirname':  'test4'
    };

    const runs = [
        { it: 'PORT', srv: 'port', option: '4444' },
        { it: 'HOST', srv: 'host', option: '127.4.4.4' },
        { it: 'ROOT_DIR', srv: 'rootDir', option: 'test4' }
    ];

    runs.forEach( run => {
        it(`Read ${ run.it } from config.json if env port null`, async () => {
            delete process.env[run.it];
            const StaticServerTest = proxyquire('../dist/fs_server.js', { '../config.json': config }).default;
            const srv = new StaticServerTest({});

            assert.equal(srv[run.srv], run.option);
        });
    });
});
