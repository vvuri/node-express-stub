import chai from 'chai';
import chaiHttp from 'chai-http';
import chaiAsPromised from 'chai-as-promised';

export function setClearEnv () {
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.ROOT_DIR;
}

let config;

function createRequester () {
    chai.use(chaiHttp);
    chai.use(chaiAsPromised);

    setClearEnv();
    config = require('../dist/fs_config');

    const url = `http://${config.HOST}:${config.PORT}`;
    const requester = chai.request(url).keepOpen();

    return requester;
}

export const requester = createRequester();
export const HOST = config.HOST;
export const PORT = config.PORT;
