import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

function _setClearEnv () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;
}

export let config;

export function setDefaultEnv () {
    process.env.PORT = '8888';
    process.env.HOST = '127.0.0.1';
    process.env.ROOT_DIR = 'public';
}

function createRequester () {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    _setClearEnv();
    config = require('../dist/fs_config');

    const url = `http://${config.HOST}:${config.PORT}`;
    const requester = chai.request(url).keepOpen();

    return requester;
}

export const requester = createRequester();
