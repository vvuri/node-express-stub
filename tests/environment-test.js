const chai = require('chai');
const proxyquire = require('proxyquire').noPreserveCache();

const assert = chai.assert;

const TESTPORT = '8888';
const TESTHOST = '127.0.0.1';
const TESTROOTDIR = 'public';

const { HOST, PORT, ROOT_DIR }  = require('../dist/fs_config');

describe('Environment test:', () => {
    const initialEnvVar = {};

    it(`Positive: PORT = ${TESTPORT}`, async () => {
        assert.equal(PORT, TESTPORT);
    });

    it(`Positive: HOST = ${TESTHOST}`, async () => {
        assert.equal(HOST, TESTHOST);
    });

    it(`Positive: ROOT_DIR = ${TESTROOTDIR}`, async () => {
        assert.equal(ROOT_DIR, TESTROOTDIR);
    });

    before(() => {
        initialEnvVar.PORT = process.env.PORT;
        initialEnvVar.HOST = process.env.HOST;
        initialEnvVar.ROOT_DIR = process.env.ROOT_DIR;

        process.env.PORT = TESTPORT;
        process.env.HOST = TESTHOST;
        process.env.ROOT_DIR = TESTROOTDIR;
    });

    after(() => {
        process.env.PORT = initialEnvVar.PORT;
        process.env.HOST = initialEnvVar.HOST;
        process.env.ROOT_DIR = initialEnvVar.ROOT_DIR;
    });
});

// Don`t work with .env file
describe('Load from file when environment undefined:', () => {
    const initialEnvVar = {};

    const config = {
        'hostname': '127.4.4.4',
        'port':     '4444',
        'dirname':  'test4'
    };

    it(`Read PORT from config.json if env port null`, () => {
        delete process.env.PORT;
        const example = proxyquire('../dist/fs_config.js', { '../config.json': config });

        assert.equal(example.PORT, '4444');
    });

    it(`Read HOST from config.json if env host null`, () => {
        delete process.env.HOST;
        const example = proxyquire('../dist/fs_config.js', { '../config.json': config });

        assert.equal(example.HOST, '127.4.4.4');
    });

    it(`Read ROOT_DIR from config.json if env host null`, () => {
        delete process.env.ROOT_DIR;
        const example = proxyquire('../dist/fs_config.js', { '../config.json': config });

        assert.equal(example.ROOT_DIR, 'test4');
    });

    before(() => {
        initialEnvVar.PORT = process.env.PORT;
        initialEnvVar.HOST = process.env.HOST;
        initialEnvVar.ROOT_DIR = process.env.ROOT_DIR;
    });

    after(() => {
        process.env.PORT = initialEnvVar.PORT;
        process.env.HOST = initialEnvVar.HOST;
        process.env.ROOT_DIR = initialEnvVar.ROOT_DIR;
    });
});
