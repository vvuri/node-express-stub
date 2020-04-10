const chai = require('chai');
const proxyquire = require('proxyquire').noPreserveCache();

const assert = chai.assert;

describe('Environment variable should be set, if it is specified:', () => {
    const runs = [
        { it: 'PORT', option: '8888' },
        { it: 'HOST', option: '127.0.0.1' },
        { it: 'ROOT_DIR', option: 'public' }
    ];

    runs.forEach( run => {
        it(`Positive: Port should be set by process.env.${ run.it } = ${ run.option }`, async () => {
            process.env[run.it] = run.option;
            const example = proxyquire('../dist/fs_config.js', {});

            assert.equal(example[run.it], run.option);
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
        { it: 'PORT', option: '4444' },
        { it: 'HOST', option: '127.4.4.4' },
        { it: 'ROOT_DIR', option: 'test4' }
    ];

    runs.forEach( run => {
        it(`Read ${ run.it } from config.json if env port null`, () => {
            process.env[run.it] = run.option;
            const example = proxyquire('../dist/fs_config.js', { '../config.json': config });

            delete process.env[run.it];
            assert.equal(example[run.it], run.option);
        });
    });
});
