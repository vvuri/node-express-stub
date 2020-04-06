const chai = require('chai');
const proxyquire = require('proxyquire').noPreserveCache();

const assert = chai.assert;

const { HOST, PORT, ROOT_DIR }  = require('../dist/fs_config');

describe('Environment variable should be set, if it is specified:', () => {
    const TESTPORT = '8888';
    const TESTHOST = '127.0.0.1';
    const TESTROOTDIR = 'public';

    it(`Positive: Port should be set by process.env.PORT = ${TESTPORT}`, async () => {
        process.env.PORT = TESTPORT;
        assert.equal(PORT, TESTPORT);
    });

    it(`Positive: Host name should be set by process.env.HOST = ${TESTHOST}`, async () => {
        process.env.HOST = TESTHOST;
        assert.equal(HOST, TESTHOST);
    });

    it(`Positive: Public directory should be set by process.env.ROOT_DIR = ${TESTROOTDIR}`, async () => {
        process.env.ROOT_DIR = TESTROOTDIR;
        assert.equal(ROOT_DIR, TESTROOTDIR);
    });
});

// Don`t work with .env file
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
            delete process.env[run.it];
            const example = proxyquire('../dist/fs_config.js', { '../config.json': config });

            assert.equal(example[run.it], run.option);
        });
    });
});
