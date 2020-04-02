const chai = require('chai');

const assert = chai.assert;

const TESTPORT = '8888';
const TESTHOST = '127.0.0.1';
const TESTROOTDIR = 'public';

process.env.PORT = TESTPORT;
process.env.HOST = TESTHOST;
process.env.ROOT_DIR = TESTROOTDIR;

const { HOST, PORT, ROOT_DIR }  = require('../dist/fs_config');

describe('Environment test:', () => {
    it(`Positive: PORT = ${TESTPORT}`, async () => {
        assert.equal(PORT, TESTPORT);
    });

    it(`Positive: HOST = ${TESTHOST}`, async () => {
        assert.equal(HOST, TESTHOST);
    });

    it(`Positive: ROOT_DIR = ${TESTROOTDIR}`, async () => {
        assert.equal(ROOT_DIR, TESTROOTDIR);
    });
});
